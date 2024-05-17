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

    static fromJson(data: any): Session {
        const session = new Session(data.sessionNum);
        session.isExport = data.isExport;
        session.preciseSessionStart = data.preciseSessionStart;
        session.laps = data.laps.map((lap: any) => Lap.fromJson(lap));

        return session;
    }
}
