export class Sector {
    split: number;
    sector: number;
    dataRow: Object;
    dataRowIndex: number;

    static exportFields(): string[] {
        return ['split', 'sector'];
    }

    public importFromJson(data: any): void {
        if (data.split != null) {
            this.split = data.split;
        }
        if (data.sector != null) {
            this.sector = data.sector;
        }
    }
}
