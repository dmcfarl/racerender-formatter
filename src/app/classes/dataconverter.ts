export class Conversion {
    value: string;
    label: string;
    convert: (data: Object) => any;

    constructor(value: string, label: string, convert: (data: Object) => any) {
        this.value = value;
        this.label = label;
        this.convert = convert;
    }
}

export class DataConverter {
    static conversions: Conversion[] = [
        new Conversion("None", "No conversion", (data: Object) => { }),
        new Conversion("M to Mi", "Meters to Miles", (data: Object) => { }),
        new Conversion("Mi to M", "Miles to Meters", (data: Object) => { }),
        new Conversion("MPS to MPH", "Meters Per Second to Miles Per Hour", (data: Object) => { }),
        new Conversion("KPH to MPH", "Kilometers Per Hour to Miles Per Hour", (data: Object) => { }),
        new Conversion("C to F", "Celcius To Fahrenheit", (data: Object) => { }),
        new Conversion("F to C", "Fahrenheit To Celcius", (data: Object) => { }),
        new Conversion("KPA to PSI", "KiloPascals To Pounds per Square Inch", (data: Object) => { })
    ];

    public static estimateConversion(column: string): Conversion {
        return null;
    }
}