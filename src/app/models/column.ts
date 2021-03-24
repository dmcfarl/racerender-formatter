import { ColumnConversion } from "../classes/conversion";

export class Column {
    name: string;
    export: boolean = true;
    conversion: ColumnConversion = null;

    constructor(name: string) {
        this.name = name;
    }
}


export class Columns {
    columns = new Map<string, Column>();

    public addAll(columns: Column[]) {
        columns.forEach(column => this.columns.set(column.name, column));
    }
}