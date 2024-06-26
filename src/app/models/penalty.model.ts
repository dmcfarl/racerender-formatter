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
        new PenaltyType("Time (+2s)",
            (lapTime: number) => { return lapTime < Penalty._RERUN_COUNT * Penalty._TIME_MODIFIER ? lapTime + Penalty._TIME_COUNT : lapTime },
            (penalties: number) => { return penalties < Penalty._RERUN_COUNT ? penalties + 1 : penalties }
        ),
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
        )
    ];

    constructor(type: PenaltyType, lapTime: number) {
        this.type = type;
        this.lapTime = lapTime;
    }

    static exportFields(): string[] {
        return ['type', 'lapTime'];
    }

    static findPenaltyType(name: string): PenaltyType {
        return Penalty.penaltyTypes.find((penaltyType: PenaltyType) => penaltyType.name === name);
    }

    public importFromJson(data: any): void {
        if (data.lapTime != null) {
            this.lapTime = data.lapTime;
        }
        if (data.type != null) {
            this.type = Penalty.findPenaltyType(data.type.name);
        }
    }
}