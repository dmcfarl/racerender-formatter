export class Sector {
    split: number;
    sector: number;
    dataRow: Object;
    dataRowIndex: number;

    static exportFields(): string[] {
        return ['split', 'sector'];
    }

    static fromJson(data: any): Sector {
        const sector = new Sector();
        sector.split = data.split;
        sector.sector = data.sector;

        return sector;
    }
}
