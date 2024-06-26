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

    public importFromJson(data: any): void {
        if (data.id != null) {
            this.id = data.id;
        }
        if (data.lapTime != null) {
            this.lapTime = data.lapTime;
        }
        if (data.sectors != null) {
            this.sectors.forEach((sector: Sector, sectorIndex: number) => {
                if (sectorIndex < data.sectors.length) {
                    sector.importFromJson(data.sectors[sectorIndex]);
                }
            });
            if (data.sectors.length > this.sectors.length) {
                this.sectors.push(...data.sectors.slice(this.sectors.length));
            }
        }
        if (data.penalties != null) {
            this.penalties.forEach((penalty: Penalty, penaltyIndex: number) => {
                if (penaltyIndex < data.penalties.length) {
                    penalty.importFromJson(data.penalties[penaltyIndex]);
                }
            });
            if (data.penalties.length > this.penalties.length) {
                this.penalties.push(
                    ...data.penalties
                        .slice(this.penalties.length)
                        .map((data: any) => {
                            return new Penalty(Penalty.findPenaltyType(data.type.name), data.lapTime);
                        })
                );
            }
        }
        if (data.displayId != null) {
            this.displayId = data.displayId;
        }
        if (data.isInvalid != null) {
            this.isInvalid = data.isInvalid;
        }
        if (data.editedData != null) {
            this.editedData = data.editedData;
        }
    }
}
