import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Conversion, DataConverter, DataTransformer, Transform } from "./transform/dataconverter";

export class Column {
    name: string;
    exportName: string;
    isExport: boolean = true;
    conversion: Conversion;
    transform: Transform;

    constructor(name: string) {
        this.name = name;
        this.exportName = name;
        this.conversion = DataConverter.estimateConversion(this);
        this.transform = DataTransformer.estimateTransform(this);
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