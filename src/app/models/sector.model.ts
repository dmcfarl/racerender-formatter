export class Sector {
    split: number;
    sector: number;
    dataRow: Object;
    dataRowIndex: number;

    static exportFields(): string[] {
        return ['split', 'sector'];
    }
}
