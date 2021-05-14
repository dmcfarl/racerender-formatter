import { Injectable } from "@angular/core";
import { merge as _merge } from 'lodash';
import { allRaceExportFields, Lap, Penalty, PenaltyType, Race, Sector } from "./race";
import { Column } from "./reader/column";
import { allCSVDataExportFields, CSVData } from "./reader/csvdata";
import { CSVReaderService } from "./reader/csvreader.service";
import { LapReaderService } from "./reader/lapreader.service";
import { Conversion, DataConverter, DataTransformer, Transform } from "./transform/dataconverter";
import { Round, Rounder } from "./transform/rounder";

@Injectable({
    providedIn: 'root'
})
export class RaceService {
    csvData: CSVData;
    race: Race;

    constructor(private csvReaderService: CSVReaderService, private lapReaderService: LapReaderService) { }

    extractData(file: File): Promise<CSVData> {
        let promise = this.csvReaderService.extract(file);
        promise.then((data: CSVData) => {
            this.csvData = data;
            this.extractLaps();
        }).catch((reason: any) => {
            console.log(reason);
        });

        return promise;
    }

    extractLaps(): Promise<Race> {
        let promise = this.lapReaderService.extract(this.csvData.parsed);
        promise.then((race) => {
            this.race = race;
            this.updateBestLap();
        }).catch((reason: any) => {
            console.log(reason);
        });

        return promise;
    }

    updateBestLap() {
        this.race.best = null;
        this.race.allLaps.forEach(lap => {
            lap.lapTime = Rounder.round(lap.lapTime, 3);
            let lapDisplay = lap.lapDisplay;
            if (this.race.best == null) {
                this.race.best = lap;
                lap.previousBest = lap;
            } else if (lapDisplay < this.race.best.lapDisplay) {
                lap.previousBest = this.race.best;
                this.race.best = lap;
            } else {
                lap.previousBest = this.race.best;
            }
            if (lap.sectors.length > 0) {
                let lastSector = lap.sectors[lap.sectors.length - 1];
                if (lastSector.split !== lap.lapTime) {
                    lastSector.split = lap.lapTime;
                    lastSector.sector = lap.sectors.length > 1 ? Rounder.round(lastSector.split - lap.sectors[lap.sectors.length - 2].split, 3) : lastSector.split;
                }
            }
        });
    }

    updateSectors(lap: Lap) {
        lap.sectors.forEach((sector: Sector, index: number) => {
            sector.sector = Rounder.round(sector.split - (index > 0 ? lap.sectors[index - 1].split : 0), 3);
        });
    }

    export(): string {
        return JSON.stringify({
            csvData: this.csvData,
            race: this.race
        }, this.replacerWithPath(this.exportReplacer), 4);
    }

    private exportReplacer(field: string, value: any, path: string, allowedFields: string[]) {
        if (field === "editedData") {
            console.log("editedData");
        }
        if (path !== "" && isNaN(+field) && allowedFields.indexOf(field) < 0 && path.indexOf("editedData") < 0) {
            return undefined;
        }
        
        return value;
    }

    private replacerWithPath(replacer: (arg0: string, arg1: any, arg2: string, arg3: string[]) => any) {
        let m = new Map();
        let allowedFields = allCSVDataExportFields().concat(allRaceExportFields());

        return function (field: string, value: any) {
            let path = m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field);
            if (value === Object(value)) m.set(value, path);
            return replacer.call(this, field, value, path.replace(/undefined\.\.?/, ''), allowedFields);
        }
    }

    import(config: File): Promise<Object> {
        let promise = new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.onload = (event) => {
                let data = JSON.parse(fileReader.result as string);

                _merge(this, data);

                // Didn't save functions in Configuration.json.
                // Iterate through the options in order to find the exact object which has the needed functions.
                this.csvData.columns.forEach((column: Column) => {
                    column.conversion = DataConverter.conversions.find((conversion: Conversion) => conversion.name === column.conversion.name);
                    column.transform = DataTransformer.transforms.find((transform: Transform) => transform.name === column.transform.name);
                    column.round = Rounder.roundOptions.find((round: Round) => round.value === column.round.value);
                });

                this.race.allLaps.forEach((lap: Lap) => {
                    lap.penalties.forEach((penalty: Penalty) => penalty.type = Penalty.penaltyTypes.find((penaltyType: PenaltyType) => penaltyType.name === penalty.type.name));
                });

                resolve(data);
            }
            fileReader.onerror = (event) => {
                reject(event);
            }
            fileReader.readAsText(config);
        });

        return promise;
    }
}