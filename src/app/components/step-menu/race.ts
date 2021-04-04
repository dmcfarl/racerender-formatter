import { splitAtColon } from "@angular/compiler/src/util";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class Race {
    best: Lap;
    sessions: Session[] = [];
    laps: Lap[] = [];
    sessionBuffer: number = 15;
}

export class Session {
    isExport: boolean = false;
    laps: Lap[] = [];
    sessionNum: number;
    preciseSessionStart: number = 0;
    constructor(sessionNum: number) {
        this.sessionNum = sessionNum;
    }
}

export class Lap {
    startBufferData: Object[] = [];
    lapData: Object[] = [];
    finishBufferData: Object[] = [];
    sectors: Sector[] = [];
    lapTime: number;
    lapDisplay: number;
    lapStart: Object;
    lapStartIndex: number;
    lapFinish: Object;
    lapFinishIndex: number;
    dataStartTime: number;
    id: number;
    preciseStartTime: number;
    penalties: Penalty[] = [];
    previousBest: Lap;

    constructor(id: number) {
        this.id = id;
    }

    get allData() {
        return this.startBufferData.concat(this.lapData).concat(this.finishBufferData);
    }

    static asFormGroup(lap: Lap): FormGroup {
        const fg = new FormGroup({
            //isExport: new FormControl(lap.isExport, Validators.required),
            id: new FormControl(lap.id, Validators.pattern('[0-9]+')),
            time: new FormControl(lap.lapTime, Validators.pattern('[0-9]+(.[0-9]+)?')),
            sectors: new FormArray(lap.sectors.map(sector => Sector.asFormGroup(sector))),
            penalties: new FormControl(lap.penalties.map(penalty => Penalty.asFormGroup(penalty)))
        });
        return fg;
    }
}

export class Sector {
    dataRow: Object;
    dataRowIndex: number;
    split: number;
    sector: number;

    static asFormGroup(sector: Sector): FormGroup {
        const fg = new FormGroup({
            split: new FormControl(sector.split, Validators.pattern('[0-9]+(.[0-9]+)?'))
        });
        return fg;
    }
}

export class PenaltyType {
    name: string;
    penalize: (lapTime: number) => number;

    constructor(name: string, penalize: (lapTime: number) => number) {
        this.name = name;
        this.penalize = penalize;
    }
}

export class Penalty {
    type: PenaltyType;
    lapTime: number;

    private static _DNF_TIME = 30 * 60;
    private static _OFF_TIME = 20 * 60;
    private static _RERUN_TIME = 40 * 60;
    private static _TIME_TIME = 2 * 60;

    static penaltyTypes: PenaltyType[] = [
        new PenaltyType("DNF", (lapTime: number) => {
            return Penalty._DNF_TIME;
        }),
        new PenaltyType("Off Course", (lapTime: number) => {
            return lapTime !== Penalty._DNF_TIME ? Penalty._OFF_TIME : lapTime;
        }),
        new PenaltyType("Rerun", (lapTime: number) => {
            return lapTime !== Penalty._DNF_TIME && lapTime !== Penalty._OFF_TIME ? Penalty._RERUN_TIME : lapTime;
        }),
        new PenaltyType("Time (+2s)", (lapTime: number) => {
            return lapTime + Penalty._TIME_TIME;
        })
    ];

    constructor(type: PenaltyType, lapTime: number) {
        this.type = type;
        this.lapTime = lapTime;
    }

    static asFormGroup(penalty: Penalty): FormGroup {
        const fg = new FormGroup({
            type: new FormControl(penalty.type, Validators.required),
            lapTime: new FormControl(penalty.lapTime, Validators.pattern('[0-9]*(.[0-9]+)?'))
        });
        return fg;
    }
}