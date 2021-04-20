import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class Race {
    best: Lap;
    sessions: Session[] = [];
    laps: Lap[] = [];
    sessionBuffer: number = 15;

    export(): Object {
        return {
            sessions: this.sessions.map((session: Session) => session.export()),
            sessionBuffer: this.sessionBuffer
        };
    }

    static import(obj: Object): Race {
        let race = new Race();
        race.sessions = obj["sessions"].map((element: Object) => Session.import(element));
        race.sessionBuffer = obj["sessionBuffer"];

        return race;
    }
}

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

    export(): Object {
        return {
            isExport: this.isExport,
            laps: this.laps.map((lap: Lap) => lap.export()),
            sessionNum: this.sessionNum,
            preciseSessionStart: this.preciseSessionStart
        };
    }

    static import(obj: Object): Session {
        let session = new Session(obj["sessionNum"]);
        session.isExport = obj["isExport"];
        session.laps = obj["laps"].map((element: Object) => Lap.import(element));
        session.preciseSessionStart = obj["preciseSessionStart"];

        return session;
    }
}

export class Lap {
    lapData: Object[][] = [];
    editableData: Object[] = [];
    editedData: Map<number, Object> = new Map();
    sectors: Sector[] = [];
    lapTime: number;
    lapStart: Object;
    lapStartIndex: number;
    lapStartPrecise: Object;
    lapStartIndexPrecise: number;
    lapFinish: Object;
    lapFinishIndex: number;
    id: number;
    penalties: Penalty[] = [];
    previousBest: Lap;
    overlay?: any;

    constructor(id: number) {
        this.id = id;
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

    getPenaltyCount(lapTime: number): number {
        let penaltyCount = 0;
        this.penalties.filter((penalty: Penalty) => penalty.lapTime <= lapTime).forEach((penalty: Penalty) => {
            penaltyCount = penalty.type.countPenalties(penaltyCount);
        });
        return penaltyCount;
    }

    get lapDisplay(): number {
        let lapDisplay = this.lapTime;
        this.penalties.forEach((penalty: Penalty) => {
            lapDisplay = penalty.type.penalize(lapDisplay);
        });

        return lapDisplay;
    }

    export(): Object {
        return {
            editedData: this.editedData,
            sectors: this.sectors.map((sector: Sector) => sector.export()),
            lapTime: this.lapTime,
            id: this.id,
            penalties: this.penalties
        };
    }

    static import(obj: Object): Lap {
        let lap = new Lap(obj["id"]);
        lap.editedData = obj["editedData"];
        lap.sectors = obj["sectors"].map((element: Object) => Sector.import(element));
        lap.lapTime = obj["lapTime"];
        lap.penalties = obj["penalties"];

        return lap;
    }
}

export class Sector {
    split: number;
    sector: number;
    dataRow: Object;
    dataRowIndex: number;

    static asFormGroup(sector: Sector): FormGroup {
        const fg = new FormGroup({
            split: new FormControl(sector.split, Validators.pattern('[0-9]+(.[0-9]+)?'))
        });
        return fg;
    }

    export(): Object {
        return { 
            split: this.split, 
            sector: this.sector
        };
    }

    static import(obj: Object): Sector {
        let sector = new Sector();
        sector.split = obj["split"];
        sector.sector = obj["sector"];

        return sector;
    }
}

export class PenaltyType {
    name: string;
    penalize: (lapTime: number) => number;
    countPenalties: (penalties: number) => number;

    constructor(name: string, penalize: (lapTime: number) => number, countPenalties: (penalties: number) => number) {
        this.name = name;
        this.penalize = penalize;
        this.countPenalties = countPenalties;
    }
}

export class Penalty {
    type: PenaltyType;
    lapTime: number;

    private static _DNF_COUNT = 15;
    private static _OFF_COUNT = 10;
    private static _RERUN_COUNT = 20;
    private static _TIME_COUNT = 1;

    private static _TIME_MODIFIER = 2 * 60;

    static penaltyTypes: PenaltyType[] = [
        new PenaltyType("DNF",
            (lapTime: number) => { return Penalty._DNF_COUNT * Penalty._TIME_MODIFIER; },
            (penalties: number) => { return Penalty._DNF_COUNT }
        ),
        new PenaltyType("Off Course",
            (lapTime: number) => { return lapTime !== Penalty._DNF_COUNT * Penalty._TIME_MODIFIER ? Penalty._OFF_COUNT * Penalty._TIME_MODIFIER : lapTime; },
            (penalties: number) => { return penalties !== Penalty._DNF_COUNT ? Penalty._OFF_COUNT : penalties }
        ),
        new PenaltyType("Rerun",
            (lapTime: number) => { return lapTime !== Penalty._DNF_COUNT * Penalty._TIME_MODIFIER && lapTime !== Penalty._OFF_COUNT * Penalty._TIME_MODIFIER ? Penalty._RERUN_COUNT * Penalty._TIME_MODIFIER : lapTime; },
            (penalties: number) => { return penalties !== Penalty._DNF_COUNT && penalties !== Penalty._OFF_COUNT ? Penalty._RERUN_COUNT : penalties }
        ),
        new PenaltyType("Time (+2s)",
            (lapTime: number) => { return lapTime < Penalty._OFF_COUNT * Penalty._TIME_MODIFIER ? lapTime + Penalty._TIME_COUNT * Penalty._TIME_MODIFIER : lapTime },
            (penalties: number) => { return penalties < Penalty._OFF_COUNT ? penalties + 1 : penalties }
        )
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