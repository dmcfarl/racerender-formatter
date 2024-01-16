import { Conversion, DataConverter, DataTransformer, Transform } from "../services/dataconverter.service";
import { Round, Rounder } from "../services/rounder.service";

export class Column {
    name: string;
    exportName: string;
    isExport: boolean;
    conversion: Conversion;
    transform: Transform;
    round: Round;

    constructor(name: string) {
        this.name = name;
        this.exportName = name;
        this.isExport = name !== "Lap #" && name !== "Session fragment #";
        this.conversion = DataConverter.estimateConversion(this);
        this.transform = DataTransformer.estimateTransform(this);
        this.round = Rounder.estimateRound(this);
    }

    static exportFields(): string[] {
        return ['name', 'exportName', 'isExport', 'conversion', 'transform', 'round'];
    }
}


export class Columns {
    columns = new Map<string, Column>();

    public addAll(columns: Column[]) {
        columns.forEach(column => this.columns.set(column.name, column));
    }
}