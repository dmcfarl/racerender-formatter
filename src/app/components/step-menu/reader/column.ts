import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Conversion, DataConverter, DataTransformer, Transform } from "../transform/dataconverter";
import { Round, Rounder } from "../transform/rounder";

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

    static asFormGroup(column: Column): FormGroup {
        const fg = new FormGroup({
            isExport: new FormControl(column.isExport, Validators.required),
            name: new FormControl(column.name, Validators.required),
            conversion: new FormControl(column.conversion, Validators.required),
            transform: new FormControl(column.transform, Validators.required)
        });
        return fg;
    }
}


export class Columns {
    columns = new Map<string, Column>();

    public addAll(columns: Column[]) {
        columns.forEach(column => this.columns.set(column.name, column));
    }
}