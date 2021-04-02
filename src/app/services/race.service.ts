import { Injectable } from "@angular/core";
import { Lap, Race, Sector } from "../components/multistep-form/race";
import { CSVData } from "../components/multistep-form/reader/csvdata";
import { CSVReaderService } from "../components/multistep-form/reader/csvreader.service";
import { LapReaderService } from "../components/multistep-form/reader/lapreader.service";

@Injectable({
    providedIn: 'root'
})
export class RaceService {
    csvData: CSVData;
    race: Race;

    constructor(private csvReaderService: CSVReaderService, private lapReaderService: LapReaderService) {}

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
        this.race.laps.forEach(lap => {
            if (this.race.best == null) {
                this.race.best = lap;
            } else if (lap.lapTime < this.race.best.lapTime) {
                lap.previousBest = this.race.best;
                this.race.best = lap;
            } else {
                lap.previousBest = this.race.best;
            }
        });
    }

    updateSectors(lap: Lap) {
        lap.sectors.forEach((sector: Sector, index: number) => {
            sector.sector = sector.split - (index > 0 ? lap.sectors[index - 1].split : 0);
        });
    }
}