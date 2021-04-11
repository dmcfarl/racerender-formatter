import { Injectable } from "@angular/core";
import { Race, Lap, Sector, Session } from "../race";
import { Rounder } from "../transform/rounder";

@Injectable({
    providedIn: 'root'
})
export class LapReaderService {
    public async extract(data: Object[]): Promise<Race> {
        let promise = new Promise<Race>((resolve, reject) => {
            let race: Race = new Race();
            let session: Session = null;
            let lap: Lap = null;
            let previousRow: Object = data[0];

            // Extract lap information by iterating over all of the data.
            // Determine lap times, start and finish, and sector times based on "Lap #" column
            data.forEach((value, index) => {
                let lapNum = value["Lap #"];
                if (lapNum != null) {
                    // Inside a lap
                    if (lap != null && lapNum !== lap.id) {
                        // Just crossed the start/finish for a new lap in the same session
                        lap.lapFinishIndex = index - 1;
                        lap.lapFinish = previousRow;
                        lap.lapTime = Rounder.round(lap.lapFinish["UTC Time (s)"] - lap.lapStart["UTC Time (s)"], 3);
                        lap = null;
                    }
                    if (lap == null) {
                        // Create a new lap
                        lap = new Lap(lapNum);
                        lap.lapStart = value;
                        if (session == null) {
                            // Create a new session
                            session = new Session(race.sessions.length + 1);
                            race.sessions.push(session);
                        }
                        session.laps.push(lap);
                        lap.lapStartIndex = index;
                        lap.lapStart = value;
                    } else if (value["Trap name"] != null) {
                        // Add a new sector
                        let sector = new Sector();
                        sector.dataRow = value;
                        sector.dataRowIndex = index;
                        sector.split = Rounder.round(value["UTC Time (s)"] - lap.lapStart["UTC Time (s)"], 3);
                        sector.sector = lap.sectors.length > 0 ? Rounder.round(sector.split - lap.sectors[lap.sectors.length - 1].split, 3) : sector.split;
                        lap.sectors.push(sector);
                    }
                } else if (lap != null) {
                    // Row after last lap of the session
                    lap.lapFinishIndex = index - 1;
                    lap.lapFinish = previousRow;
                    lap.lapTime = Rounder.round(lap.lapFinish["UTC Time (s)"] - lap.lapStart["UTC Time (s)"], 3);
                    lap = null;
                    session = null;
                }

                previousRow = value;
            });

            race.laps = [].concat(...race.sessions.map(session => session.laps));

            if (race.laps.length == 0) {
                reject("No laps found!");
            }

            resolve(race);
        });

        return promise;
    }
}