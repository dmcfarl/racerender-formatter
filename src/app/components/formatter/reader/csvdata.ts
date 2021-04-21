import { Conversion, Transform } from "../transform/dataconverter";
import { Round } from "../transform/rounder";
import { Column } from "./column";

export function allCSVDataExportFields(): string[] {
    return ['csvData'].concat(CSVData.exportFields(), Column.exportFields(), Conversion.exportFields(), Transform.exportFields(), Round.exportFields());
}

export class CSVData {
    filename: string;
    columns: Column[];
    parsed: Object[];

    static exportFields(): string[] {
        return ['filename', 'columns'];
    }
}