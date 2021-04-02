import { Injectable } from "@angular/core";
import { Race } from "../components/multistep-form/race";
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
        }).catch((reason: any) => {
            console.log(reason);
        });

        return promise;
    }

    extractLaps(): Promise<Race> {
        let promise = this.lapReaderService.extract(this.csvData.parsed);
        promise.then((race) => {
            this.race = race;
        }).catch((reason: any) => {
            console.log(reason);
        });

        return promise;
    }
}