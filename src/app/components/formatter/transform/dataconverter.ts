import { Column, Lap, Race, Session } from "../../../models";

export class Conversion {
    name: string;
    label: string;
    convert: (data: any) => any;

    constructor(name: string, label: string, convert: (data: any) => any) {
        this.name = name;
        this.label = label;
        this.convert = convert;
    }

    static exportFields(): string[] {
        return ['name'];
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

    public static estimateConversion(column: Column): Conversion {
        if (column.name.indexOf("(.C)") >= 0) {
            column.exportName = column.exportName.replace("(.C)", "(.F)");
            return DataConverter.conversions[5];
        } else if (column.name.indexOf("(m)") >= 0 && column.name.indexOf("position") < 0) {
            column.exportName = column.exportName.replace("(m)", "(mi)");
            return DataConverter.conversions[1];
        } else if (column.name.indexOf("(m/s)") >= 0) {
            column.exportName = column.exportName.replace("(m/s)", "(mph)");
            return DataConverter.conversions[3];
        } else if (column.name.indexOf("(kPa)") >= 0) {
            column.exportName = column.exportName.replace("(kPa)", "(psi)");
            return DataConverter.conversions[7];
        }
        return DataConverter.conversions[0];
    }
}

export class Transform {
    name: string;
    transform: (column: Column, data: Object, race: Race, session: Session, lap: Lap) => any;

    constructor(name: string, transform: (column: Column, data: Object, race: Race, session: Session, lap: Lap) => any) {
        this.name = name;
        this.transform = transform;
    }

    static exportFields(): string[] {
        return ['name'];
    }
}

export class DataTransformer {
    static transforms: Transform[] = [
        new Transform("None", (column: Column, data: Object, race: Race, session: Session, lap: Lap) => {
            return data[column.name];
        }),
        new Transform("Session Time", (column: Column, data: Object, race: Race, session: Session, lap: Lap) => {
            // Find the true start of the session: lapAnchor row with the sessionBuffer before it.
            return data["UTC Time (s)"] - (session.laps[0].lapAnchor["UTC Time (s)"] - race.sessionBuffer);
        }),
        new Transform("Relative to Lap Start", (column: Column, data: Object, race: Race, session: Session, lap: Lap) => {
            return lap != null ? data[column.name] - lap.lapStartPrecise[column.name] : 0;
        }),
        new Transform("Boost (kPa)", (column: Column, data: Object, race: Race, session: Session, lap: Lap) => {
            return data["Manifold pressure (kPa) *obd"] - data["Barometric pressure (kPa) *obd"];
        })
    ]

    public static estimateTransform(column: Column): Transform {
        if (column.name === "Time (s)") {
            return DataTransformer.transforms[1];
        } else if (column.name.indexOf("Boost") >= 0) {
            return DataTransformer.transforms[3];
        } else if (column.name.indexOf("Distance") >= 0) {
            return DataTransformer.transforms[2];
        }
        return DataTransformer.transforms[0];
    }
}