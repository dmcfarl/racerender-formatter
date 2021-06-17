import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export function allRaceExportFields(): string[] {
    return ['race'].concat(Race.exportFields(), Session.exportFields(), Lap.exportFields(), Sector.exportFields(), Penalty.exportFields(), PenaltyType.exportFields());
}

export class Race {
    best: Lap;
    sessions: Session[] = [];
    allLaps: Lap[] = [];
    sessionBuffer: number = 15;

    static exportFields(): string[] {
        return ['sessions', 'sessionBuffer'];
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

    static exportFields(): string[] {
        return ['isExport', 'laps', 'sessionNum', 'preciseSessionStart'];
    }
}

export class Lap {
    lapData: Object[][] = [];
    editableData: Object[] = [];
    editedData: Object = {};
    sectors: Sector[] = [];
    lapTime: number;
    lapAnchor: Object;
    lapAnchorIndex: number;
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

    static exportFields(): string[] {
        return ['editedData', 'sectors', 'lapTime', 'id', 'penalties'];
    }
}

export class Sector {
    split: number;
    sector: number;
    dataRow: Object;
    dataRowIndex: number;

    static exportFields(): string[] {
        return ['split', 'sector'];
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

    static exportFields(): string[] {
        return ['name'];
    }
}

export class Penalty {
    type: PenaltyType;
    lapTime: number;

    private static _DNF_COUNT = 12;
    private static _OFF_COUNT = 11;
    private static _RERUN_COUNT = 10;
    private static _TIME_COUNT = 2;

    private static _TIME_MODIFIER = 2 * 60;

    static penaltyTypes: PenaltyType[] = [
        new PenaltyType("DNF",
            (lapTime: number) => { return Penalty._DNF_COUNT * Penalty._TIME_MODIFIER; },
            (penalties: number) => { return Penalty._DNF_COUNT }
        ),
        new PenaltyType("Off Course",
            (lapTime: number) => { return lapTime <= Penalty._OFF_COUNT * Penalty._TIME_MODIFIER ? Penalty._OFF_COUNT * Penalty._TIME_MODIFIER : lapTime; },
            (penalties: number) => { return penalties <= Penalty._OFF_COUNT ? Penalty._OFF_COUNT : penalties }
        ),
        new PenaltyType("Rerun",
            (lapTime: number) => { return lapTime <= Penalty._RERUN_COUNT * Penalty._TIME_MODIFIER ? Penalty._RERUN_COUNT * Penalty._TIME_MODIFIER : lapTime; },
            (penalties: number) => { return penalties <= Penalty._RERUN_COUNT ? Penalty._RERUN_COUNT : penalties }
        ),
        new PenaltyType("Time (+2s)",
            (lapTime: number) => { return lapTime < Penalty._RERUN_COUNT * Penalty._TIME_MODIFIER ? lapTime + Penalty._TIME_COUNT : lapTime },
            (penalties: number) => { return penalties < Penalty._RERUN_COUNT ? penalties + 1 : penalties }
        )
    ];

    constructor(type: PenaltyType, lapTime: number) {
        this.type = type;
        this.lapTime = lapTime;
    }

    static exportFields(): string[] {
        return ['type', 'lapTime'];
    }
}