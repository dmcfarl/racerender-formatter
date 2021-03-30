import { Column } from "../column";
import { Lap } from "../race";

export class Conversion {
    value: string;
    label: string;
    convert: (data: any) => any;

    constructor(value: string, label: string, convert: (data: any) => any) {
        this.value = value;
        this.label = label;
        this.convert = convert;
    }
}

export class DataConverter {
    static conversions: Conversion[] = [
        new Conversion("None", "No conversion", (data: any) => { 
            return data;
        }),
        new Conversion("M to Mi", "Meters to Miles", (data: any) => { 
            return data * 32 / 51499;
        }),
        new Conversion("Mi to M", "Miles to Meters", (data: any) => { 
            return data * 51499 / 32;
        }),
        new Conversion("MPS to MPH", "Meters Per Second to Miles Per Hour", (data: any) => { 
            return data * 143 / 64;
        }),
        new Conversion("KPH to MPH", "Kilometers Per Hour to Miles Per Hour", (data: any) => { 
            return data * 5 / 8;
        }),
        new Conversion("C to F", "Celcius To Fahrenheit", (data: any) => { 
            return data * 9 / 5 + 32;
        }),
        new Conversion("F to C", "Fahrenheit To Celcius", (data: any) => { 
            return (data - 32) * 5 / 9;
        }),
        new Conversion("KPA to PSI", "KiloPascals To Pounds per Square Inch", (data: any) => { 
            return data * 4000 / 27579;
        })
    ];

    public static estimateConversion(column: string): Conversion {
        if (column.indexOf("(.C)") >= 0) {
            return DataConverter.conversions[5];
        } else if (column.indexOf("(m)") >= 0 && column.indexOf("position") < 0) {
            return DataConverter.conversions[1];
        } else if (column.indexOf("(m/s)") >= 0) {
            return DataConverter.conversions[3];
        } else if (column.indexOf("(kPa)") >= 0) {
            return DataConverter.conversions[7];
        }
        return DataConverter.conversions[0];
    }
}

export class Transform {
    value: string;
    transform: (columns: Column, data: Object, lap: Lap) => any;

    constructor(value: string, transform: (columns: Column, data: Object, lap: Lap) => any) {
        this.value = value;
        this.transform = transform;
    }
}

export class DataTransformer {
    static transforms: Transform[] = [
        new Transform("None", (columns: Column, data: Object, lap: Lap) => { 
            return data[columns.name];
        }),
        new Transform("Relative to Start", (columns: Column, data: Object, lap: Lap) => { 
            return data[columns.name] - lap.lapStart[columns.name];
        }),
        new Transform("Boost (kPa)", (columns: Column, data: Object, lap: Lap) => { 
            return data["Manifold pressure (kPa) *OBD"] - data["Barometric pressure (kPa) *OBD"];
        })
    ]

    public static estimateTransform(column: string): Transform {
        if (column.indexOf("Boost") >= 0) {
            return DataTransformer.transforms[2];
        } else if (column.indexOf("Distance") >= 0) {
            return DataTransformer.transforms[1];
        }
        return DataTransformer.transforms[0];
    }
}