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
        this.extractStartBuffer(session);
        this.extractLapData(session);
        this.extractFinishBuffer(session);
    }

    private extractStartBuffer(session: Session) {
        let csvData: Object[] = this.raceService.csvData.parsed;
        let startBuffer: Object[] = [];
        let startLap: Lap = session.laps[0];

        startLap.lapStartPrecise = startLap.lapStart;
        startLap.lapStartIndexPrecise = startLap.lapStartIndex;

        // Buffer data prior to lapStart
        for (let i = startLap.lapStartIndex - 1; i > 0 && this.getSessionTime(startLap.lapStartIndex, i) < this.raceService.race.sessionBuffer; i--) {
            if (session.preciseSessionStart < 0 && this.getSessionTime(i, startLap.lapStartIndex) > session.preciseSessionStart) {
                // Precise lap start occurs before lapStart. Just set *Precise values instead of buffering since these should 
                // actually be a part of lapData instead.
                startLap.lapStartPrecise = csvData[i];
                startLap.lapStartIndexPrecise = i;
            } else {
                // Add to lapStartBuffer
                startBuffer.unshift(this.transformRow(csvData[i], session, null));
            }
        }

        if (session.preciseSessionStart > 0) {
            // Precise lap start occurs after lapStart. Continue buffering data until we hit the first row within the 
            // official start of the precise lap.
            let i = startLap.lapStartIndex;
            for (i; i < csvData.length && this.getSessionTime(i, startLap.lapStartIndex) < session.preciseSessionStart; i++) {
                startBuffer.push(this.transformRow(csvData[i], session, null));
            }
            startLap.lapStartPrecise = csvData[i];
            startLap.lapStartIndexPrecise = i;
        }

        session.startBufferData = startBuffer;
    }

    private extractLapData(session: Session) {
        let csvData: Object[] = this.raceService.csvData.parsed;
        let startLap: Lap = session.laps[0];

        let i = startLap.lapStartIndexPrecise;
        let lapTime = session.preciseSessionStart;
        session.laps.forEach(lap => {
            // These values might not be set if we have multiple laps in a session.
            // Set them now to be sure.
            lap.lapStartPrecise = csvData[i];
            lap.lapStartIndexPrecise = i;

            let nextSector = 0;
            let lapData: Object[][] = [];
            let sectorData: Object[] = [];
            for (i; i < csvData.length && this.getSessionTime(i, startLap.lapStartIndex) < lapTime + lap.lapTime; i++) {
                // Add rows to the lap while under the lap time.
                if (nextSector < lap.sectors.length && this.getSessionTime(i, startLap.lapStartIndex) > lapTime + lap.sectors[nextSector].split) {
                    // Found the row for the next sector. Set it and move on to the following sector.
                    lap.sectors[nextSector].dataRowIndex = i;
                    lap.sectors[nextSector].dataRow = csvData[i];
                    nextSector++;
                    // Save the sectorData in the lapData
                    lapData.push(sectorData);
                    sectorData = [];
                }
                sectorData.push(this.transformRow(csvData[i], session, lap));
            }
            lapData.push(sectorData);
            lapTime += lap.lapTime;
            lap.lapData = lapData;
            lap.lapFinishIndex = i - 1;
            lap.lapFinish = sectorData[sectorData.length - 1];
            if (lap.sectors.length > 0) {
                // Ensure that the last sector matches the lap finish.
                lap.sectors[lap.sectors.length - 1].dataRowIndex = i - 1;
                lap.sectors[lap.sectors.length - 1].dataRow = csvData[i - 1];
            }
        });
    }

    private extractFinishBuffer(session: Session) {
        let csvData: Object[] = this.raceService.csvData.parsed;
        let finishBuffer: Object[] = [];
        let startLap: Lap = session.laps[0];
        let finishTime: number = session.laps.map(lap => lap.lapTime).reduce((prev, curr) => prev + curr, 0);

        for (let i = session.laps[session.laps.length - 1].lapFinishIndex + 1;  i < csvData.length && this.getSessionTime(i, startLap.lapStartIndex) < finishTime + this.raceService.race.sessionBuffer; i++) {
            // Buffer rows after the precise lap finish
            finishBuffer.push(this.transformRow(csvData[i], session, session.laps[session.laps.length - 1]));
        }

        session.finishBufferData = finishBuffer;
    }

    private getSessionTime(lhsIndex: number, rhsIndex: number) : number {
        return this.raceService.csvData.parsed[lhsIndex]["UTC Time (s)"] - this.raceService.csvData.parsed[rhsIndex]["UTC Time (s)"];
    }

    private transformRow(datum: Object, session: Session, lap: Lap) : Object {
        let transformed = {};
        this.raceService.csvData.columns.forEach((column: Column) => {
            if (column.isExport) {
                let value = datum[column.name];
                value = column.conversion.convert(value);
                value = column.transform.transform(column, datum, this.raceService.race, session, lap);
                if (typeof value === "number") {
                    value = Rounder.round(value, column.round.value);
                }
                transformed[column.exportName] = value;
            }
        });

        return transformed;
    }
}