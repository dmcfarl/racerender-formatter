import { Lap } from "./lap.model";

export class Session {
    startBufferData: Object[] = [];
    finishBufferData: Object[] = [];
    isExport: boolean = false;
    laps: Lap[] = [];
    sessionNum: number;
    preciseSessionStart: number = 0;

    constructor(sessionNum: number) {
        this.sessionNum = sessionNum;
    }

    static exportFields(): string[] {
        return ['isExport', 'laps', 'sessionNum', 'preciseSessionStart'];
    }

    public  importFromJson(data: any): void {
        if (data.sessionNum != null) {
            this.sessionNum = data.sessionNum;
        }
        if (data.isExport != null) {
            this.isExport = data.isExport;
        }
        if (data.preciseSessionStart != null) {
            this.preciseSessionStart = data.preciseSessionStart;
        }
        if (data.laps != null) {
            this.laps.forEach((lap: Lap, lapIndex: number) => {
                if (lapIndex < data.laps.length) {
                    lap.importFromJson(data.laps[lapIndex]);
                }
            });
            if (data.laps.length > this.laps.length) {
                this.laps.push(...data.laps.slice(this.laps.length));
            }
        }
    }
}
