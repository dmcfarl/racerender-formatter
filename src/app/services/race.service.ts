import { EventEmitter, Injectable } from "@angular/core";
import { merge as _merge } from 'lodash';
import { allCSVDataExportFields, allRaceExportFields, Column, CSVData, Lap, Penalty, PenaltyType, Race, Sector, Session } from "../models";
import { CSVReaderService } from "./csvreader.service";
import { LapReaderService } from "./lapreader.service";
import { Conversion, DataConverter, DataTransformer, Transform } from "./dataconverter.service";
import { Round, Rounder } from "./rounder.service";

@Injectable({
    providedIn: 'root'
})
export class RaceService {
    csvData: CSVData = null;
    race: Race;
    importEmitter = new EventEmitter<boolean>();

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
                lap.previousBest = Lap.getEmptyLap(lap);
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
                // Map to classes
                data.race = Race.fromJson(data.race);

                _merge(this, data);

                if (this.csvData != null) {
                    // Didn't save functions in Configuration.json.
                    // Iterate through the options in order to find the exact object which has the needed functions.
                    this.csvData.columns.forEach((column: Column) => {
                        column.conversion = DataConverter.conversions.find((conversion: Conversion) => conversion.name === column.conversion.name);
                        column.transform = DataTransformer.transforms.find((transform: Transform) => transform.name === column.transform.name);
                        column.round = Rounder.roundOptions.find((round: Round) => round.value === column.round.value);
                    });
                }

                this.updateBestLap();

                resolve(data);
            }
            fileReader.onerror = (event) => {
                reject(event);
            }
            fileReader.readAsText(config);
        });

        return promise;
    }

    initializeRace() {
        this.race = new Race();
        const session = new Session(1);
        this.race.sessions.push(session);
        
        const lap = new Lap(1);
        lap.lapTime = 0;
        session.laps.push(lap);
        this.race.allLaps.push(lap);

        const sector = new Sector();
        sector.split = lap.lapTime;
        sector.sector = lap.lapTime;
        lap.sectors.push(sector);

        this.updateBestLap();
    }

    
    addSession(): Session {
        const session = new Session(this.race.sessions.length + 1);
        session.preciseSessionStart = null;
        session.absoluteFirstLapFinish = 0;
        this.addLap(session);

        this.race.sessions.push(session);

        return session;
    }

    removeSession(toRemove: Session) {
        // Remove the session and reset sessionNumbers
        this.race.sessions = this.race.sessions.filter((session: Session) => {
            const originalSessionNum = session.sessionNum;
            if (session.sessionNum > toRemove.sessionNum) {
                session.sessionNum--;
            }
            return originalSessionNum !== toRemove.sessionNum
        });
        // Remove the laps and reset lap ids
        if (toRemove.laps.length > 0) {
            const lapIndex = toRemove.laps[0].id - 1;
            this.race.allLaps.splice(lapIndex, toRemove.laps.length);
            for (let i = lapIndex; i < this.race.allLaps.length; i++) {
                this.race.allLaps[i].id -= toRemove.laps.length;
            }
        }
        // Best lap may have shifted or been removed; recalculate.
        this.updateBestLap();
    }

    addLap(session: Session) {
        let lapNum: number = 1;
        if (session.laps.length > 0) {
            // We already have laps in this session; just add 1 to the last id
            lapNum = session.laps[session.laps.length - 1].id + 1;
        } else {
            // Find the last lap that occurred before this session.
            // id is 1-based, but using 0-based index
            for (let i = session.sessionNum - 2; i >= 0; i--) {
                const previousSession = this.race.sessions[i];
                if (previousSession.laps.length > 0) {
                    lapNum = previousSession.laps[previousSession.laps.length - 1].id + 1;
                    break;
                }
            }
        }

        const lap = new Lap(lapNum);
        lap.lapTime = 0;
        session.laps.push(lap);
        if (this.race.allLaps.length > 0) {
            // Add sectors to the lap
            for (let i = 0; i < this.race.allLaps[0].sectors.length; i++) {
                const sector = new Sector();
                sector.split = lap.lapTime;
                lap.sectors.push(sector);
            }
            this.updateSectors(lap);

            // Add lap and update ids
            this.race.allLaps.splice(lapNum - 1, 0, lap);
            for (let i = lapNum; i < this.race.allLaps.length; i++) {
                this.race.allLaps[i].id += 1;
            }
        } else {
            const sector = new Sector();
            sector.split = lap.lapTime;
            sector.sector = lap.lapTime;
            lap.sectors.push(sector);

            this.race.allLaps.push(lap);
        }

        this.updateBestLap();
    }

    removeLap(session: Session, toRemove: Lap) {
        session.laps = session.laps.filter((lap: Lap) => lap.id !== toRemove.id);

        this.race.allLaps = this.race.allLaps.filter((lap: Lap) => {
            const originalLapNum = lap.id;
            if (lap.id > toRemove.id) {
                lap.id--;
            }
            return originalLapNum !== toRemove.id;
        });

        this.updateBestLap();
    }
}