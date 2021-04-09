import { Injectable } from "@angular/core";
import { RaceService } from "src/app/services/race.service";
import { Lap, Sector, Session } from "../race";
import { Column } from "../reader/column";
import { Rounder } from "./rounder";

@Injectable({
    providedIn: 'root'
})
export class SessionTransformService {
    
    constructor(private raceService: RaceService) { }

    transformSession(session: Session) {
        // Extract Data
        session.laps[0].startBufferData = this.extractStartBuffer(session);
        this.extractLapData(session);
        session.laps[session.laps.length - 1].finishBufferData = this.extractFinishBuffer(session);
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
                startBuffer.unshift(this.transformRow(this.raceService.csvData.parsed[i], null));
            }
        }

        if (session.preciseSessionStart > 0) {
            let i = startLap.lapStartIndex;
            for (i; i < this.raceService.csvData.parsed.length && this.getSessionTime(i, startLap.lapStartIndex) < session.preciseSessionStart; i++) {
                startBuffer.push(this.transformRow(this.raceService.csvData.parsed[i], null));
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
                data.push(this.transformRow(this.raceService.csvData.parsed[i], lap));
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
            finishBuffer.push(this.transformRow(this.raceService.csvData.parsed[i], session.laps[session.laps.length - 1]));
        }

        return finishBuffer;
    }

    private getSessionTime(lhsIndex: number, rhsIndex: number) : number {
        return this.raceService.csvData.parsed[lhsIndex]["UTC Time (s)"] - this.raceService.csvData.parsed[rhsIndex]["UTC Time (s)"];
    }

    private transformRow(datum: Object, lap: Lap) : Object {
        let transformed = {};
        this.raceService.csvData.columns.forEach((column: Column) => {
            if (column.isExport) {
                let value = datum[column.name];
                value = column.conversion.convert(value);
                value = column.transform.transform(column, datum, lap);
                if (typeof value === "number") {
                    value = Rounder.round(value, column.round.value);
                }
                transformed[column.exportName] = value;
            }
        });

        return transformed;
    }
}