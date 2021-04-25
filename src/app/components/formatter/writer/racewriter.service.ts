import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { unparse, UnparseConfig } from "papaparse";
import { RaceService } from "src/app/components/formatter/race.service";
import { Lap, Race, Sector, Session } from "../race";
import { Rounder } from "../transform/rounder";
import * as JSZip from 'jszip';
import { Column } from "../reader/column";

@Injectable({
    providedIn: 'root'
})
export class RaceWriterService {
    
    constructor(private raceService: RaceService, private datePipe: DatePipe) { }

    write(): Promise<Blob> {
        let zip = new JSZip();
        this.raceService.race.sessions.filter((session: Session) => session.isExport).forEach((session: Session) => {
            let filename = `${session.laps.length > 1 ? "Session" : "Lap"} ${session.sessionNum}`;
            zip.file(filename + ".csv", this.writeSession(session));
            zip.file(filename + "-timing.csv", this.writeSessionTiming(session));
        });
        zip.file("Display.csv", this.writeIntroDisplay());
        zip.file("Configuration.json", this.raceService.export());

        return zip.generateAsync({ type: "blob" });
    }

    private writeSession(session: Session): string {
        let data = this.writePrologue();

        const config: UnparseConfig = {
            header: true,
            newline: "\n",
            columns: this.raceService.csvData.columns.filter((column: Column) => column.isExport).map((column: Column) => column.exportName)
        }
        // Add session start buffer
        data.push(unparse(session.startBufferData, config));
        // Only need the header once.  Set to false so that subsequent unparsing doesn't contain any headers.
        config.header = false;
        // Add Lap 0 comment
        data.push(this.getLapComment(0, this.raceService.race.sessionBuffer + session.preciseSessionStart));

        // Unparse each lap
        session.laps.forEach((lap: Lap, lapIndex: number) => {
            let startIndex = 0;
            lap.lapData.forEach((sectorData: Object[], index: number) => {
                data.push(unparse(sectorData, config));
                if (index < lap.sectors.length) {
                    data.push(this.getSectorComment(index + 1, lap.sectors[index].sector));
                } else {
                    console.warn("More data than sectors!");
                }
            });
            data.push(this.getLapComment(lapIndex + 1, lap.lapTime));
        });
        data.push(unparse(session.finishBufferData, config));
        data.push("# Session End");

        return data.join("\n");
    }

    private writeSessionTiming(session: Session): string {

        let data = this.writePrologue();

        // Anchor row is the original start of the first lap of the session.  Subtract the session buffer to get to Session Time of 0.
        let sessionUTC = Rounder.round(session.laps[0].lapStart["UTC Time (s)"] - this.raceService.race.sessionBuffer, 3);
        let sessionTime = 0;
        let firstTimingRow = this.getTimingRow(sessionTime, sessionUTC, -1, this.raceService.race, session, session.laps[0], session.laps[0].previousBest);
        const config: UnparseConfig = {
            header: true,
            newline: "\n",
            columns: Object.keys(firstTimingRow)
        };

        data.push(unparse([firstTimingRow], config));
        // Only need the header once.  Set to false so that subsequent unparsing doesn't contain any headers.
        config.header = false;
        sessionTime += this.raceService.race.sessionBuffer + session.preciseSessionStart - 0.001;
        data.push(unparse([this.getTimingRow(sessionTime, sessionUTC + sessionTime, -1, this.raceService.race, session, session.laps[0], session.laps[0].previousBest)], config));
        sessionTime += 0.001;
        // Lap 0 Comment
        data.push(this.getLapComment(0, sessionTime));
        session.laps.forEach((lap: Lap, index: number) => {
            data.push(unparse([this.getTimingRow(sessionTime, sessionUTC + sessionTime, 0, this.raceService.race, session, lap, lap.previousBest)], config));

            // Determine a timeline of "events" that happen within the lap: either crossing a sector or a penalty occurring.
            // Remove any duplicates by using a Set but then converting back into an array.
            let eventTimes = [...new Set(lap.sectors.map(sector => sector.split).concat(...lap.penalties.map(penalty => penalty.lapTime)))];
            // Sort the events so that we com across them in order.
            eventTimes.sort();

            let nextSector = 0;
            eventTimes.forEach((lapTime: number) => {
                // Use the millisecond before the time of the event to ensure that transitions between numbers are crisp and clean.
                data.push(unparse([this.getTimingRow(sessionTime + lapTime - 0.001, sessionUTC + sessionTime + lapTime - 0.001, lapTime - 0.001, this.raceService.race, session, lap, lap.previousBest)], config));
                if (nextSector < lap.sectors.length && lap.sectors[nextSector].split === lapTime) {
                    data.push(this.getSectorComment(nextSector + 1, lap.sectors[nextSector].sector));
                    nextSector++;
                }

                // Don't print the last row of the lap.  Will get printed at the start of the next lap (or when printing the previous sessions' laps).
                if (lapTime === lap.lapTime) {
                    data.push(this.getLapComment(index + 1, lap.lapTime));
                } else {
                    data.push(unparse([this.getTimingRow(sessionTime + lapTime, sessionUTC + sessionTime + lapTime, lapTime, this.raceService.race, session, lap, lap.previousBest)], config));
                }
            });

            sessionTime += lap.lapTime;
        });
        let lastLap = session.laps[session.laps.length - 1];
        // Print the row for the end of the last lap
        data.push(unparse([this.getTimingRow(sessionTime, sessionUTC + sessionTime, lastLap.lapTime, this.raceService.race, session, lastLap, lastLap.previousBest)], config));
        if (session.sessionNum > 1) {
            // Print a lap "separator" so that the LapList understands that these occurred in previous sessions.
            data.push(this.getLapComment(session.laps.length + 1, 0));
            // Print data for each lap that occurred in a previous session.
            this.raceService.race.sessions.filter((previousSession: Session) => previousSession.sessionNum < session.sessionNum).forEach((previousSession: Session) => {
                previousSession.laps.forEach((lap: Lap) => {
                    lap.sectors.forEach((sector: Sector, index: number) => {
                        data.push(this.getSectorComment(index + 1, sector.sector));
                    });
                    let lapDisplay = lap.lapDisplay;
                    data.push(this.getLapComment(session.laps.length + 1 + lap.id, lapDisplay));
                    sessionTime += lapDisplay;
                });
            });
            sessionTime += this.raceService.race.sessionBuffer;
            // Print a row after all of the previous laps so that RaceRender won't cut off additional laps due to the data file not being long enough.
            data.push(unparse([this.getTimingRow(sessionTime, sessionUTC + sessionTime, lastLap.lapTime, this.raceService.race, session, lastLap, lastLap.previousBest)], config));
        }
        data.push("# Session End");

        return data.join("\n");
    }

    private writeIntroDisplay(): string {
        const config: UnparseConfig = {
            header: true,
            newline: "\n",
            columns: ["Time","DisplayTitle","DisplayBody","Transparency"]
        };
        let data: Object[] = [
            { "Time": 0, "DisplayTitle": 0, "DisplayBody": 0, "Transparency": 100 },
            { "Time": 1, "DisplayTitle": 0, "DisplayBody": 0, "Transparency": 100 },
            { "Time": 1.5, "DisplayTitle": 1, "DisplayBody": 0, "Transparency": 100 },
            { "Time": 2, "DisplayTitle": 1, "DisplayBody": 1, "Transparency": 100 },
            { "Time": 3, "DisplayTitle": 1, "DisplayBody": 1, "Transparency": 0 },
            { "Time": 8, "DisplayTitle": 1, "DisplayBody": 1, "Transparency": 0 },
            { "Time": 9, "DisplayTitle": 1, "DisplayBody": 1, "Transparency": 100 },
            { "Time": 9.5, "DisplayTitle": 1, "DisplayBody": 0, "Transparency": 100 },
            { "Time": 10, "DisplayTitle": 0, "DisplayBody": 0, "Transparency": 100 },
            { "Time": 120, "DisplayTitle": 0, "DisplayBody": 0, "Transparency": 100 }
        ];

        return unparse(data, config);
    }

    private writePrologue(): string[] {
        // Add prologue comments
        let data: string[] = [
            "# RaceRender Data",
            "# RaceRenderFormatter: https://github.com/dmcfarl/racerender-formatter"
        ];

        let bestLap = this.raceService.race.best;

        data.push(`# Start Point: ${bestLap.lapStartPrecise["Longitude (deg)"]},${bestLap.lapStartPrecise["Latitude (deg)"]} @ ${Rounder.round(bestLap.lapStartPrecise["Bearing (deg)"], 2)} deg`);
        // Don't print a sector for the finish line.  Handled as "End Point" instead.
        bestLap.sectors.filter((sector: Sector, index: number) => index < bestLap.sectors.length - 1).forEach((sector: Sector, index: number) => {
            data.push(`# Split Point ${index + 1}: ${sector.dataRow["Longitude (deg)"]},${sector.dataRow["Latitude (deg)"]} @ ${Rounder.round(sector.dataRow["Bearing (deg)"], 2)} deg`);
        });
        data.push(`# End Point: ${bestLap.lapFinish["Longitude (deg)"]},${bestLap.lapFinish["Latitude (deg)"]} @ ${Rounder.round(bestLap.lapFinish["Bearing (deg)"], 2)} deg`);

        return data;
    }

    private getLapComment(lapNum: number, seconds: number) : string {
        return `# Lap ${lapNum}: ${this.datePipe.transform(seconds * 1000, 'HH:mm:ss.SSS', 'UTC')}`;
    }

    private getSectorComment(sectorNum: number, seconds: number) : string {
        return `# Sector ${sectorNum}: ${this.datePipe.transform(seconds * 1000, 'HH:mm:ss.SSS', 'UTC')}`;
    }

    private getTimingRow(sessionTime: number, utcTime: number, lapTime: number, race: Race, session: Session, currentLap: Lap, previousLap: Lap): Object {
        lapTime = Rounder.round(lapTime, 3);
        let timingData = {
            "Time": Rounder.round(sessionTime, 3),
            "UTC Time": Rounder.round(utcTime, 3),
            "Session Lap Start": session.laps[0].id,
            "Session Laps": session.laps.length,
            "Total Laps": race.allLaps.length,
            "Current Lap Number": currentLap.id
        };
        // Current Sectors
        currentLap.sectors.forEach((sector: Sector, index: number) => {
            timingData[`Current Split ${index + 1}`] = sector.split;
        });

        // Current Penalties
        timingData["Current Penalty"] = currentLap.getPenaltyCount(lapTime);

        if (lapTime === currentLap.lapTime) {
            // At the end of the session. Determine if we need to print currentLap if it's better than previousLap
            let currentLapTime = currentLap.lapTime;
        }
        timingData["Previous Lap Number"] = (lapTime === currentLap.lapTime && currentLap.lapDisplay < previousLap.lapDisplay) ? currentLap.id : previousLap.id;
        // Previous Sectors
        previousLap.sectors.forEach((sector: Sector, index: number) => {
            timingData[`Previous Split ${index + 1}`] = sector.split;
        });

        // Current Penalties
        timingData["Previous Penalty"] = previousLap.getPenaltyCount(lapTime);

        return timingData;
    }
}