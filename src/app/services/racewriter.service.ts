
import { Injectable } from "@angular/core";
import { unparse, UnparseConfig } from "papaparse";
import { RaceService } from "src/app/services/race.service";
import { Column, Lap, Penalty, Race, Sector, Session } from "../models";
import { Rounder } from "./rounder.service";
import * as JSZip from 'jszip';
import { TimePipe } from "../components/timetextbox/time.pipe";

@Injectable({
    providedIn: 'root'
})
export class RaceWriterService {
    
    constructor(private raceService: RaceService, private timePipe: TimePipe) { }

    write(): Promise<Blob> {
        let zip = new JSZip();
        this.raceService.race.sessions.filter((session: Session) => session.isExport).forEach((session: Session) => {
            let filename = `${session.laps.length > 1 ? "Session" : "Lap"} ${session.sessionNum}`;
            if (this.raceService.csvData != null) {
                zip.file(filename + ".csv", this.writeSession(session));
            }
            zip.file(filename + "-timing.csv", this.writeSessionTiming(session));
        });
        if (this.raceService.csvData != null) {
            zip.file("Display.csv", this.writeIntroDisplay());
        }
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
        session.laps.filter((lap: Lap) => !lap.isInvalid).forEach((lap: Lap, lapIndex: number) => {
            let lapDataIndex = 0;
            lap.lapData.forEach((sectorData: Object[], index: number) => {
                // Push all data from the sector.
                // Keep track of the index since that was what was used when editting the data.
                // Assign the edited data on top of the existing row if it exists.
                data.push(unparse(sectorData.map((row: Object) => 
                    row["UTC Time (s)"] in lap.editedData ? Object.assign({}, row, lap.editedData[row["UTC Time (s)"]]) : row), 
                    config));
                if (index < lap.sectors.length) {
                    data.push(this.getSectorComment(index + 1, lap.sectors[index].sector));
                } else {
                    console.warn("More data than sectors!");
                }
                lapDataIndex += sectorData.length;
            });
            data.push(this.getLapComment(lapIndex + 1, lap.lapTime));
        });
        data.push(unparse(session.finishBufferData, config));
        data.push("# Session End");

        return data.join("\n");
    }

    private writeSessionTiming(session: Session): string {

        let data = this.writePrologue();

        let sessionTime = 0;
        let firstTimingRow = this.getTimingRow(sessionTime, -1, this.raceService.race, session, session.laps[0], session.laps[0].previousBest);
        const config: UnparseConfig = {
            header: true,
            newline: "\n",
            columns: Object.keys(firstTimingRow)
        };

        data.push(unparse([firstTimingRow], config));
        // Only need the header once.  Set to false so that subsequent unparsing doesn't contain any headers.
        config.header = false;
        sessionTime += this.raceService.race.sessionBuffer + session.preciseSessionStart;
        data.push(unparse([this.getTimingRow(sessionTime - 0.5, -0.5, this.raceService.race, session, session.laps[0], session.laps[0].previousBest)], config));
        if (session.reactionTime != null && session.reactionTime < 0.5) {
            data.push(unparse([this.getTimingRow(sessionTime - 0.5 + session.reactionTime, session.reactionTime - 0.5, this.raceService.race, session, session.laps[0], session.laps[0].previousBest)], config));
        }
        data.push(unparse([this.getTimingRow(sessionTime, -1, this.raceService.race, session, session.laps[0], session.laps[0].previousBest)], config));
        // Lap 0 Comment
        data.push(this.getLapComment(0, sessionTime));
        sessionTime += 0.001;
        session.laps.forEach((lap: Lap, index: number) => {
            data.push(unparse([this.getTimingRow(sessionTime, 0, this.raceService.race, session, lap, lap.previousBest)], config));

            // Determine a timeline of "events" that happen within the lap: either crossing a sector or a penalty occurring.
            // Remove any duplicates by using a Set but then converting back into an array.
            let eventTimes = lap.sectors.map(sector => sector.split).concat(...lap.penalties.map(penalty => penalty.lapTime));
            if (session.enableRT60) {
                if (session.reactionTime != null && session.reactionTime > 0.5) {
                    eventTimes.push(session.reactionTime);
                }
                if (session.sixtyFootTime != null) {
                    eventTimes.push(session.sixtyFootTime);
                }
            }
            eventTimes = [...new Set(eventTimes)];
            // Sort the events so that we come across them in order.
            eventTimes.sort((a: number, b: number) => a - b);

            let nextSector = 0;
            eventTimes.forEach((lapTime: number) => {
                // Use the millisecond during the time of the event to ensure that transitions between numbers are crisp and clean.
                data.push(unparse([this.getTimingRow(sessionTime + lapTime - 0.001, lapTime - 0.001, this.raceService.race, session, lap, lap.previousBest)], config));
                if (nextSector < lap.sectors.length && lap.sectors[nextSector].split === lapTime) {
                    data.push(this.getSectorComment(nextSector + 1, lap.sectors[nextSector].sector));
                    nextSector++;
                }

                // Don't print the last row of the lap.  Will get printed at the start of the next lap (or when printing the previous sessions' laps).
                if (lapTime === lap.lapTime) {
                    data.push(this.getLapComment(index + 1, lap.lapTime));
                } else {
                    data.push(unparse([this.getTimingRow(sessionTime + lapTime, lapTime, this.raceService.race, session, lap, lap.previousBest)], config));
                }
            });

            sessionTime += lap.lapTime;
        });
        let lastLap = session.laps[session.laps.length - 1];
        // Print the row for the end of the last lap
        data.push(unparse([this.getTimingRow(sessionTime, lastLap.lapTime, this.raceService.race, session, lastLap, lastLap.previousBest)], config));
        if (session.sessionNum > 1) {
            // Print a lap "separator" so that the LapList understands that these occurred in previous sessions.
            data.push(this.getLapComment(session.laps.length + 1, 0));
            // Print data for each lap that occurred in a previous session.
            this.raceService.race.sessions.filter((previousSession: Session) => previousSession.sessionNum < session.sessionNum).forEach((previousSession: Session) => {
                previousSession.laps.filter((lap: Lap) => !lap.isInvalid).forEach((lap: Lap) => {
                    lap.sectors.forEach((sector: Sector, index: number) => {
                        if (sector.sector > 0) {
                            data.push(this.getSectorComment(index + 1, sector.sector));
                        }
                    });
                    data.push(this.getLapComment(session.laps.length + 1 + lap.displayId, lap.lapTime));
                    sessionTime += lap.lapTime;
                });
            });
        }
        sessionTime += this.raceService.race.sessionBuffer;
        // Print a row after all of the previous laps so that RaceRender won't cut off additional laps due to the data file not being long enough.
        data.push(unparse([this.getTimingRow(sessionTime, lastLap.lapTime, this.raceService.race, session, lastLap, lastLap.previousBest)], config));
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

        if (bestLap.lapStartPrecise != null && bestLap.lapFinish != null) {
            data.push(`# Start Point: ${bestLap.lapStartPrecise["Longitude (deg)"]},${bestLap.lapStartPrecise["Latitude (deg)"]} @ ${Rounder.round(bestLap.lapStartPrecise["Bearing (deg)"], 2)} deg`);
            // Don't print a sector for the finish line.  Handled as "End Point" instead.
            bestLap.sectors.filter((sector: Sector, index: number) => index < bestLap.sectors.length - 1).forEach((sector: Sector, index: number) => {
                data.push(`# Split Point ${index + 1}: ${sector.dataRow["Longitude (deg)"]},${sector.dataRow["Latitude (deg)"]} @ ${Rounder.round(sector.dataRow["Bearing (deg)"], 2)} deg`);
            });
            data.push(`# End Point: ${bestLap.lapFinish["Longitude (deg)"]},${bestLap.lapFinish["Latitude (deg)"]} @ ${Rounder.round(bestLap.lapFinish["Bearing (deg)"], 2)} deg`);
        }

        return data;
    }

    private getLapComment(lapNum: number, seconds: number) : string {
        return `# Lap ${lapNum}: ${this.timePipe.transform(seconds, true)}`;
    }

    private getSectorComment(sectorNum: number, seconds: number) : string {
        return `# Sector ${sectorNum}: ${this.timePipe.transform(seconds, true)}`;
    }

    private getTimingRow(sessionTime: number, lapTime: number, race: Race, session: Session, currentLap: Lap, previousLap: Lap): Object {
        lapTime = Rounder.round(lapTime, 3);
        let timingData = {
            "Time": Rounder.round(sessionTime, 3),
            "Session Lap Start": session.laps[0].displayId,
            "Session Laps": session.laps.filter((lap: Lap) => !lap.isInvalid).length,
            "Total Laps": race.allLaps.filter((lap: Lap) => !lap.isInvalid).length,
            "Current Lap Number": currentLap.displayId
        };
        // Current Sectors
        currentLap.sectors.forEach((sector: Sector, index: number) => {
            timingData[`Current Split ${index + 1}`] = sector.split;
            timingData[`Current Sector ${index + 1}`] = sector.sector;
        });

        // Current Penalties
        timingData["Current Penalty"] = currentLap.getPenaltyCount(lapTime);
        timingData["Current Penalty Time"] = currentLap.penalties[0]?.lapTime ?? 0;

        timingData["Current Best Lap Number"] = (lapTime === currentLap.lapTime && (currentLap.lapDisplay < previousLap.lapDisplay || previousLap.lapDisplay < 0)) ? currentLap.displayId : previousLap.displayId;
        timingData["Previous Best Lap Number"] = previousLap.displayId;
        timingData["Previous Lap Number"] = previousLap.displayId;
        // Previous Sectors
        previousLap.sectors.forEach((sector: Sector, index: number) => {
            timingData[`Previous Split ${index + 1}`] = sector.split;
            timingData[`Previous Sector ${index + 1}`] = sector.sector;
        });

        // Current Penalties
        timingData["Previous Penalty"] = previousLap.getPenaltyCount(lapTime);

        race.allLaps.filter((lap: Lap) => !lap.isInvalid && lap.displayId <= session.laps[session.laps.length - 1].displayId && lap.penalties.length > 0).forEach((lap: Lap) => {
            timingData["Penalty Lap " + lap.displayId] = lap.penalties.reduce((count: number, curr: Penalty) => curr.type.countPenalties(count), 0);
        });
        if (session.enableRT60) {
            timingData["Reaction Time"] = this.getReactionTime(sessionTime, session);
            timingData["60ft Time"] = this.getSixtyFootTime(sessionTime, session);
        }

        return timingData;
    }

    private getReactionTime(sessionTime: number, session: Session): number {
        let reactionTime = 0;
        if (session.enableRT60 && session.reactionTime != null) {
            let reactionStart = this.raceService.race.sessionBuffer + session.preciseSessionStart - 0.5;
            if (sessionTime > reactionStart) {
                if (sessionTime < reactionStart + session.reactionTime) {
                    // reactionTime has started, calculate the time
                    reactionTime = sessionTime - reactionStart;
                } else {
                    reactionTime = session.reactionTime;
                }
            }
        }
        return Rounder.round(reactionTime, 3);
    }

    private getSixtyFootTime(sessionTime: number, session: Session): number {
        let sixtyFootTime = 0;
        if (session.enableRT60 && session.sixtyFootTime != null && session.reactionTime != null) {
            let sixtyFootStart = this.raceService.race.sessionBuffer + session.preciseSessionStart;
            if (session.reactionTime < 0.5) {
                sixtyFootStart -= (0.5 - session.reactionTime);
            }
            if (sessionTime > sixtyFootStart) {
                if (sessionTime < sixtyFootStart + session.sixtyFootTime) {
                    // reactionTime has started, calculate the time
                    sixtyFootTime = sessionTime - sixtyFootStart;
                } else {
                    sixtyFootTime = session.sixtyFootTime;
                }
            }
        }
        return Rounder.round(sixtyFootTime, 3);
    }
}