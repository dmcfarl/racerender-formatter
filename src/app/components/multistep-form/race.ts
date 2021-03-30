import { splitAtColon } from "@angular/compiler/src/util";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class Race {
    best: Lap;
    sessions: Session[] = [];
    laps: Lap[] = [];
}

export class Session {
    laps: Lap[] = [];
    sessionNum: number;
    constructor(sessionNum: number) {
        this.sessionNum = sessionNum;
    }
}

export class Lap {
    isExport: boolean = false;
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
            isExport: new FormControl(lap.isExport, Validators.required),
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

export enum PenaltyType {
    TIME,
    OFF,
    DNF,
    RERUN
}

export class Penalty {
    type: PenaltyType;
    lapTime: number;

    static asFormGroup(penalty: Penalty): FormGroup {
        const fg = new FormGroup({
            type: new FormControl(penalty.type, Validators.required),
            lapTime: new FormControl(penalty.lapTime, Validators.pattern('[0-9]*(.[0-9]+)?'))
        });
        return fg;
    }
}