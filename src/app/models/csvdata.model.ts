import { Conversion, Transform } from "../services/dataconverter.service";
import { Round } from "../services/rounder.service";
import { Column } from "./column.model";

export function allCSVDataExportFields(): string[] {
    return ['csvData'].concat(CSVData.exportFields(), Column.exportFields(), Conversion.exportFields(), Transform.exportFields(), Round.exportFields());
}

export class CSVData {
    filename: string;
    columns: Column[];
    parsed: Object[];
    timeColumn: string;
    longitudeColumn: string;
    latitudeColumn: string;
    bearingColumn: string;

    static exportFields(): string[] {
        return ['filename', 'columns'];
    }
}