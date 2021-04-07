import { Injectable } from "@angular/core";
import { RaceService } from "src/app/services/race.service";
import { Lap, Sector, Session } from "../race";
import { Rounder } from "../transform/rounder";
import { unparse, UnparseConfig } from 'papaparse';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SessionWriterService {

    constructor(private raceService: RaceService, private datePipe: DatePipe) { }

    convertSession(session: Session): string {
        let data: string[] = [
            "# RaceRender Data\n",
            "# RaceRenderFormatter: https://github.com/dmcfarl/racerender-formatter\n"
        ];
        
        // Extract Data
        session.laps[0].startBufferData = this.extractStartBuffer(session);
        this.extractLapData(session);
        session.laps[session.laps.length - 1].finishBufferData = this.extractFinishBuffer(session);

        data.push(`# Start Point: ${session.laps[0].lapStartPrecise["Longitude (deg)"]},${session.laps[0].lapStartPrecise["Latitude (deg)"]} @ ${Rounder.round(session.laps[0].lapStartPrecise["Bearing (deg)"], 2)} deg\n`);
        session.laps[0].sectors.forEach((sector: Sector, index: number) => {
            data.push(`# Split Point ${index + 1}: ${sector.dataRow["Longitude (deg)"]},${sector.dataRow["Latitude (deg)"]} @ ${Rounder.round(sector.dataRow["Bearing (deg)"], 2)} deg\n`);
        });
        data.push(`# End Point: ${session.laps[0].lapStartPrecise["Longitude (deg)"]},${session.laps[0].lapFinish["Latitude (deg)"]} @ ${Rounder.round(session.laps[0].lapFinish["Bearing (deg)"], 2)} deg\n`);

        const config: UnparseConfig = {
            header: true,
            newline: "\n",
            columns: this.raceService.csvData.columns.map(column => column.exportName)
        }
        data.push(unparse(session.laps[0].startBufferData, config));
        config.header = false;
        data.push(this.getLapHeader(0, this.raceService.race.sessionBuffer + session.preciseSessionStart));

        session.laps.forEach((lap: Lap, lapIndex: number) => {
            let startIndex = lap.lapStartIndexPrecise;
            lap.sectors.forEach((sector: Sector, sectorIndex: number) => {
                data.push(unparse(lap.lapData.slice(startIndex - lap.lapStartIndexPrecise, sector.dataRowIndex - lap.lapStartIndexPrecise), config));
                data.push(this.getSectorHeader(sectorIndex + 1,sector.sector));
                startIndex = sector.dataRowIndex;
            });
            data.push(this.getLapHeader(lapIndex + 1, lap.lapTime));
        });
        data.push(unparse(session.laps[session.laps.length - 1].finishBufferData, config));
        data.push("# Session End");

        return data.join('');
    }

    getSessionTiming(session: Session): string {
        // TODO: Handle penalties
        const config: UnparseConfig = {
            header: true,
            newline: "\n",
            columns: ["Time,UTC Time,Session Lap Start,Session Laps,Total Laps,Current Lap Number"]
        };

        config.columns.push(...session.laps[0].sectors.map((sector: Sector, index: number) => `Current Split ${index + 1}`));
        config.columns.push("Previous Lap Number");
        config.columns.push(...session.laps[0].sectors.map((sector: Sector, index: number) => `Previous Split ${index + 1}`));

        let data: string[] = [
            "# RaceRender Data\n",
            "# RaceRenderFormatter: https://github.com/dmcfarl/racerender-formatter\n"
        ];
        let sessionUTC = session.laps[0].lapStart["UTC Time (s)"];
        data.push(unparse([this.getTimingRow(0, sessionUTC - this.raceService.race.sessionBuffer, session.laps[0].id, session.laps.length, this.raceService.race.laps.length, session.laps[0], session.laps[0].previousBest, false)], config));
        config.header = false;
        data.push(this.getLapHeader(0, this.raceService.race.sessionBuffer + session.preciseSessionStart));
        let previousLaps = 0;
        session.laps.forEach((lap: Lap, index: number) => {
            data.push(unparse([this.getTimingRow(this.raceService.race.sessionBuffer + session.preciseSessionStart + previousLaps, sessionUTC + session.preciseSessionStart + previousLaps, session.laps[0].id, session.laps.length, this.raceService.race.laps.length, lap, lap.previousBest, true)], config));
            for (let i = 0; i < lap.sectors.length - 1; i++) {
                data.push(this.getSectorHeader(i, lap.sectors[i].sector));
            }
            previousLaps += lap.lapTime;
            data.push(unparse([this.getTimingRow(this.raceService.race.sessionBuffer + session.preciseSessionStart + previousLaps - 0.001, sessionUTC + session.preciseSessionStart + previousLaps - 0.001, session.laps[0].id, session.laps.length, this.raceService.race.laps.length, lap, lap.previousBest, true)], config));
            data.push(this.getSectorHeader(lap.sectors.length - 1, lap.sectors[lap.sectors.length - 1].sector));
            data.push(this.getLapHeader(lap.id, lap.lapTime));
        });
        let lastLap = session.laps[session.laps.length - 1];
        let previousLap = lastLap.lapTime < lastLap.previousBest.lapTime ? lastLap : lastLap.previousBest;
        data.push(unparse([this.getTimingRow(this.raceService.race.sessionBuffer + session.preciseSessionStart + previousLaps, sessionUTC + session.preciseSessionStart + previousLaps, lastLap.id, session.laps.length, this.raceService.race.laps.length, lastLap, previousLap, true)], config));
        data.push(this.getLapHeader(session.laps.length + 1, 0));
        for (let i = 0; i < lastLap.id; i++) {
            let lap = this.raceService.race.laps[i];
            lap.sectors.forEach((sector: Sector, index: number) => {
                data.push(this.getSectorHeader(index, sector.sector));
            });
            data.push(this.getLapHeader(session.laps.length + 1 + lap.id, lap.lapTime));
            previousLaps += lap.lapTime;
        }
        data.push(unparse([this.getTimingRow(this.raceService.race.sessionBuffer + session.preciseSessionStart + previousLaps, sessionUTC + session.preciseSessionStart + previousLaps, lastLap.id, session.laps.length, this.raceService.race.laps.length, lastLap, previousLap, true)], config));
        data.push("# Session End");

        return data.join('');
    }

    private extractStartBuffer(session: Session): Object[] {
        let startBuffer: Object[] = [];
        let startLap: Lap = session.laps[0];

        startLap.lapStartPrecise = startLap.lapStart;
        startLap.lapStartIndexPrecise = startLap.lapStartIndex;

        for (let i = startLap.lapStartIndex - 1; i > 0 && this.getSessionTime(startLap.lapStartIndex, i) < this.raceService.race.sessionBuffer; i--) {
            if (session.preciseSessionStart < 0 && this.getSessionTime(i, startLap.lapStartIndex) > session.preciseSessionStart) {
                startLap.lapStartPrecise = this.raceService.csvData.parsed[i];
                startLap.lapStartIndexPrecise = i;
            } else {
                startBuffer.unshift(Object.assign({}, this.raceService.csvData.parsed[i]));
            }
        }

        if (session.preciseSessionStart > 0) {
            let i = startLap.lapStartIndex;
            for (i; i < this.raceService.csvData.parsed.length && this.getSessionTime(startLap.lapStartIndex, i) < session.preciseSessionStart; i++) {
                startBuffer.push(Object.assign({}, this.raceService.csvData.parsed[i]));
            }
            startLap.lapStartPrecise = this.raceService.csvData.parsed[i];
            startLap.lapStartIndexPrecise = i;
        }

        return startBuffer;
    }

    private extractLapData(session: Session) {
        let startLap: Lap = session.laps[0];

        let i = startLap.lapStartIndexPrecise;
        let lapTime = session.preciseSessionStart;
        session.laps.forEach(lap => {
            lap.lapStartPrecise = this.raceService.csvData.parsed[i];
            lap.lapStartIndexPrecise = i;
            let dirtySector = 0;
            let data: Object[] = [];
            for (i; i < this.raceService.csvData.parsed.length && this.getSessionTime(i, startLap.lapStartIndex) < lapTime + lap.lapTime; i++) {
                data.push(Object.assign({}, this.raceService.csvData.parsed[i]));
                if (dirtySector < lap.sectors.length && this.getSessionTime(i, startLap.lapStartIndex) > lapTime + lap.sectors[dirtySector].split) {
                    lap.sectors[dirtySector].dataRowIndex = i;
                    lap.sectors[dirtySector].dataRow = this.raceService.csvData.parsed[i];
                    dirtySector++;
                }
            }
            lapTime += lap.lapTime;
            lap.lapData = data;
            lap.lapFinishIndex = i - 1;
            lap.lapFinish = data[data.length - 1];
            if (lap.sectors.length > 0) {
                lap.sectors[lap.sectors.length - 1].dataRowIndex = i - 1;
                lap.sectors[lap.sectors.length - 1].dataRow = this.raceService.csvData.parsed[i - 1];
            }
        });
    }

    private extractFinishBuffer(session: Session): Object[] {
        let finishBuffer: Object[] = [];
        let startLap: Lap = session.laps[0];
        let finishTime: number = session.laps.map(lap => lap.lapTime).reduce((prev, curr) => prev + curr, 0);

        for (let i = session.laps[session.laps.length - 1].lapFinishIndex + 1;  i < this.raceService.csvData.parsed.length && this.getSessionTime(i, startLap.lapStartIndex) < finishTime + this.raceService.race.sessionBuffer; i++) {
            finishBuffer.push(Object.assign({}, this.raceService.csvData[i]));
        }

        return finishBuffer;
    }

    private getSessionTime(lhsIndex: number, rhsIndex: number) : number {
        return this.raceService.csvData.parsed[lhsIndex]["UTC Time (s)"] - this.raceService.csvData.parsed[rhsIndex]["UTC Time (s)"];
    }

    private getLapHeader(lapNum: number, seconds: number) : string {
        return `# Lap ${lapNum}: ${this.datePipe.transform(seconds, 'HH:mm:ss.SSS')}\n`;
    }

    private getSectorHeader(sectorNum: number, seconds: number) : string {
        return `# Sector ${sectorNum}: ${this.datePipe.transform(seconds, 'HH:mm:ss.SSS')}\n`;
    }

    private getTimingRow(sessionTime: number, utcTime: number, sessionLapStart: number, sessionLaps: number, totalLaps: number, currentLap: Lap, previousLap: Lap, writeCurrentSectors: boolean): Object {
        let timingData = {
            "Time": sessionTime,
            "UTC Time": utcTime,
            "Session Lap Start": sessionLapStart,
            "Session Laps": sessionLaps,
            "Total Laps": totalLaps,
            "Current Lap Number": currentLap.id,
            "Previous Lap Number": previousLap.id
        };
        currentLap.sectors.forEach((sector: Sector, index: number) => {
            timingData[`Current Split ${index + 1}`] = writeCurrentSectors ? sector.split : 0;
        });
        previousLap.sectors.forEach((sector: Sector, index: number) => {
            timingData[`Previous Split ${index + 1}`] = sector.split;
        });

        return timingData;
    }
}