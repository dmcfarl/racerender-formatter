import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Conversion, DataConverter } from "../classes/dataconverter";

export class Column {
    name: string;
    isExport: boolean = true;
    conversion: Conversion = null;

    constructor(name: string) {
        this.name = name;
        this.conversion = DataConverter.estimateConversion(name);
    }

    static asFormGroup(column: Column): FormGroup {
        const fg = new FormGroup({
            isExport: new FormControl(column.isExport, Validators.required),
            name: new FormControl(column.name, Validators.required),
            conversion: new FormControl(column.conversion, Validators.nullValidator)
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