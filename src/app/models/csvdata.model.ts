import { Conversion, Transform } from "../components/formatter/transform/dataconverter";
import { Round } from "../components/formatter/transform/rounder";
import { Column } from "./column.model";

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