import { Column } from '../models';

export class Round {
    value: number;
    label: string;

    constructor(value: number, label: string) {
        this.value = value;
        this.label = label;
    }

    static exportFields(): string[] {
        return ['value'];
    }
}

export class Rounder {
    static roundOptions: Round[] = [
        new Round(-1, "None"),
        ...Array.from(Array(9).keys()).map(value => new Round(value, value.toString()))
    ];

    static nonRoundingColumnNames: string[] = [
        "Session fragment #",
        "Lap #",
        "Trap name"
    ];

    static round(value: number, digits: number): number {
        return digits >= 0 ? parseFloat(value.toFixed(digits)) : value;
    }

    static estimateRound(column: Column): Round {
        if (column.name.indexOf("Time") >= 0) {
            return Rounder.roundOptions[4];
        } else if (column.name.toLowerCase().startsWith("lat") ||
            column.name.toLowerCase().startsWith("lon") ||
            Rounder.nonRoundingColumnNames.indexOf(column.name) >= 0) {
            return Rounder.roundOptions[0];
        } else {
            return Rounder.roundOptions[6];
        }
    }
}