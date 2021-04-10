import { Column } from "./column";

export class CSVData {
    filename: string;
    columns: Column[];
    parsed: Object[];
}