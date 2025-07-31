import { CSVData } from '../models';
import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { CSVReaderService } from './csvreader.service';

@Injectable({
    providedIn: 'root'
})
export class ZipReaderService {

    constructor(private csvReaderService: CSVReaderService) { }

    public async extract(file: File): Promise<CSVData> {
        let promise = new Promise<CSVData>((resolve, reject) => {
            let csvData: CSVData = null;
            JSZip.loadAsync(file)
            .then((contents: JSZip) => {
                const fileEntries = Object.keys(contents.files).map((filename: string) => contents.files[filename]);

                const promises : Promise<[string, string]>[] = fileEntries.map((entry: JSZip.JSZipObject) => {
                    return entry.async('string').then((contents: string) => [entry.name, contents]);
                });

                const allZips: Promise<[string, string][]> = Promise.all(promises);
                const allCSVData: Promise<CSVData>[] = [];

                allZips.then((data: [string, string][]) => {
                    data.forEach(([relativePath, contents]: [string, string]) => {
                        allCSVData.push(this.csvReaderService.extractContents(contents, relativePath));
                    });

                    Promise.all(allCSVData).then((allData: CSVData[]) => {
                        allData.sort((a: CSVData, b: CSVData) => {
                            const lapA = this.lapNumberFromFilename(a.filename);
                            const lapB = this.lapNumberFromFilename(b.filename);
                            return lapA - lapB;
                        }).forEach((parsedData: CSVData) => {
                            if (csvData == null) {
                                csvData = parsedData;
                            } else {
                                csvData.parsed.push(...parsedData.parsed);
                            }
                        });
    
                        csvData.filename = file.name.replace("zip", "extracted.csv");
                        resolve(csvData);
                    });
                });
            });
        });

        return promise;
    }

    private lapNumberFromFilename(filename: string): number {
        // Assume filename is in the format:
        // EventName-Driver-RunNumber.csv
        const dashIndex = filename.lastIndexOf('-') + 1;
        return Number(filename.substring(dashIndex, filename.indexOf('.', dashIndex)));
    }
}