import { Injectable } from "@angular/core";
import { Lap, Race, Sector } from "./race";
import { CSVData } from "./reader/csvdata";
import { CSVReaderService } from "./reader/csvreader.service";
import { LapReaderService } from "./reader/lapreader.service";
import { Rounder } from "./transform/rounder";

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
        this.race.laps.forEach(lap => {
            lap.lapTime = Rounder.round(lap.lapTime, 3);
            if (this.race.best == null) {
                this.race.best = lap;
                lap.previousBest = lap;
            } else if (lap.lapTime < this.race.best.lapTime) {
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
}