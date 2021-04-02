import { Injectable } from "@angular/core";
import { Race, Lap, Sector, Session } from "../race";

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

            data.forEach((value, index) => {
                let lapNum = value["Lap #"];
                if (lapNum != null) {
                    // Inside a lap
                    if (lap != null && lapNum !== lap.id) {
                        // Just crossed the start/finish for a new lap in the same session
                        lap.lapFinishIndex = index - 1;
                        lap.lapFinish = previousRow;
                        lap.lapTime = lap.lapFinish["UTC Time (s)"] - lap.lapStart["UTC Time (s)"];
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
                    } else if (value["Trap name"] != null) {
                        // Add a new sector
                        let sector = new Sector();
                        sector.dataRow = value;
                        sector.dataRowIndex = index;
                        sector.split = value["UTC Time (s)"] - lap.lapStart["UTC Time (s)"];
                        sector.sector = lap.sectors.length > 0 ? sector.split - lap.sectors[lap.sectors.length - 1].split : sector.split;
                        lap.sectors.push(sector);
                    }
                } else if (lap != null) {
                    // Row after last lap of the session
                    lap.lapFinishIndex = index - 1;
                    lap.lapFinish = previousRow;
                    lap.lapTime = lap.lapFinish["UTC Time (s)"] - lap.lapStart["UTC Time (s)"];
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