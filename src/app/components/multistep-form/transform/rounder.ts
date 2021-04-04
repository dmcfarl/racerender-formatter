export class Rounder {
    static round(value: number, digits: number) : number {
        return parseFloat(value.toFixed(digits));
    }
}