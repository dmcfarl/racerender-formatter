import { Injectable } from "@angular/core";
import { Race, Lap, Sector, Session, CSVData } from "../models";
import { Rounder } from "./rounder.service";

@Injectable({
    providedIn: 'root'
})
export class LapReaderService {
    public async extract(csvData: CSVData): Promise<Race> {
        let promise = new Promise<Race>((resolve, reject) => {
            let race: Race = new Race();
            let session: Session = null;
            let lap: Lap = null;
            let data: Object[] = csvData.parsed;
            let previousRow: Object = data[0];

            // Extract lap information by iterating over all of the data.
            // Determine lap times, start and finish, and sector times based on "Lap #" column
            data.forEach((value, index) => {
                if (value.hasOwnProperty("Lap #")) {
                    // Extract RaceChrono Laps
                    let lapNum = value["Lap #"];
                    if (lapNum != null) {
                        // Inside a lap
                        if (lap != null && lapNum !== lap.id) {
                            // Just crossed the start/finish for a new lap in the same session
                            lap.lapFinishIndex = index - 1;
                            lap.lapFinish = previousRow;
                            lap.lapTime = Rounder.round(lap.lapFinish[csvData.timeColumn] - lap.lapStart[csvData.timeColumn], 3);
                            lap = null;
                        }
                        if (lap == null) {
                            // Create a new lap
                            lap = new Lap(lapNum);
                            if (session == null) {
                                // Create a new session
                                session = new Session(race.sessions.length + 1);
                                race.sessions.push(session);
                            }
                            session.laps.push(lap);
                            lap.lapStartIndex = index;
                            lap.lapStart = value;
                            lap.lapAnchorIndex = index;
                            lap.lapAnchor = value;
                        } else if (value["Trap name"] != null) {
                            if (value["Trap name"].toLowerCase().startsWith("start")) {
                                lap.lapStartIndex = index;
                                lap.lapStart = value;
                                if (session.preciseSessionStart === 0) {
                                    session.preciseSessionStart = lap.lapStart[csvData.timeColumn] - lap.lapAnchor[csvData.timeColumn];
                                }
                            } else if (value["Trap name"].toLowerCase().startsWith("sector") || value["Trap name"].toLowerCase().startsWith("finish")) {
                                // Add a new sector
                                let sector = new Sector();
                                sector.dataRow = value;
                                sector.dataRowIndex = index;
                                sector.split = Rounder.round(value[csvData.timeColumn] - lap.lapStart[csvData.timeColumn], 3);
                                sector.sector = lap.sectors.length > 0 ? Rounder.round(sector.split - lap.sectors[lap.sectors.length - 1].split, 3) : sector.split;
                                lap.sectors.push(sector);
                            }
                        }
                    } else if (lap != null) {
                        // Row after last lap of the session
                        lap.lapFinishIndex = index - 1;
                        lap.lapFinish = previousRow;
                        lap.lapTime = Rounder.round(lap.lapFinish[csvData.timeColumn] - lap.lapStart[csvData.timeColumn], 3);
                        lap = null;
                        session = null;
                    }
                } else if (value.hasOwnProperty("MATH_LAP_NUMBER")) {
                    // Extract SoloStorm Laps
                    let lapNum = value["MATH_LAP_NUMBER"];
                    if (lap == null || lapNum != lap.id) {
                        lap = new Lap(lapNum);
                        lap.lapAnchorIndex = index;
                        lap.lapAnchor = value;
                        
                        // Create a new session
                        session = new Session(race.sessions.length + 1);
                        race.sessions.push(session);

                        session.laps.push(lap);
                    }
                    let sectorNum = value["MATH_SECTOR_NUMBER"];
                    if (sectorNum == 2 && lap.lapStart == null) {
                        lap.lapStartIndex = index;
                        lap.lapStart = value;
                        if (session.preciseSessionStart === 0) {
                            session.preciseSessionStart = lap.lapStart[csvData.timeColumn] / 1000 - lap.lapAnchor[csvData.timeColumn] / 1000;
                        }

                        lap.lapFinishIndex = index;
                        lap.lapFinish = value;
                        lap.lapTime = Rounder.round(lap.lapFinish[csvData.timeColumn] / 1000 - lap.lapStart[csvData.timeColumn] / 1000, 3);
                    } else if (sectorNum > 2 && sectorNum > lap.lapFinish["MATH_SECTOR_NUMBER"]) {
                        if (lap.lapFinish["MATH_SECTOR_NUMBER"] > 2) {
                            // Add a new sector
                            let sector = new Sector();
                            sector.dataRow = value;
                            sector.dataRowIndex = index;
                            sector.split = Rounder.round(lap.lapFinish[csvData.timeColumn] / 1000 - lap.lapStart[csvData.timeColumn] / 1000, 3);
                            sector.sector = lap.sectors.length > 0 ? Rounder.round(sector.split - lap.sectors[lap.sectors.length - 1].split, 3) : sector.split;
                            lap.sectors.push(sector);
                        }
                        lap.lapFinishIndex = index;
                        lap.lapFinish = value;
                        lap.lapTime = Rounder.round(lap.lapFinish[csvData.timeColumn] / 1000 - lap.lapStart[csvData.timeColumn] / 1000, 3);
                    }
                }

                previousRow = value;
            });

            race.allLaps = [].concat(...race.sessions.map(session => session.laps));

            if (race.allLaps.length == 0) {
                reject("No laps found!");
            }

            resolve(race);
        });

        return promise;
    }
}