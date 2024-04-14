import { Penalty } from "./penalty.model";
import { Sector } from "./sector.model";

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
    displayId: number;
    penalties: Penalty[] = [];
    previousBest: Lap;
    overlay?: any;
    isInvalid: boolean = false;

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
        return ['editedData', 'sectors', 'lapTime', 'id', 'penalties', 'displayId', 'isInvalid'];
    }

    static getEmptyLap(lap: Lap): Lap {
        const empty = new Lap(0);
        empty.lapTime = -1;
        const emptySector = new Sector();
        emptySector.split = -1;
        emptySector.sector = -1;
        for(let i = 0; i < lap.sectors.length; i++) {
            empty.sectors.push(emptySector);
        }
        return empty;
    }

    static fromJson(data: any): Lap {
        const lap = new Lap(data.id);
        lap.lapTime = data.lapTime;
        lap.sectors = data.sectors.map((sector: any) => Sector.fromJson(sector));
        lap.penalties = data.penalties.map((penalty: any) => Penalty.fromJson(penalty));
        lap.displayId = data.displayId;
        lap.isInvalid = data.isInvalid;

        return lap;
    }
}
