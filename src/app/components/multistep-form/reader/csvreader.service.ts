import { FormArray } from '@angular/forms';
import { parse, ParseConfig, ParseError, Parser, ParseResult } from 'papaparse';
import { MultistepFormComponent } from '../multistep-form.component';
import { MatTableDataSource } from '@angular/material/table';
import { Column } from '../column';
import { CSVData } from './csvdata';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CSVReaderService {

    public async extract(file: File): Promise<CSVData> {
        //fileDisplay.parsed = 0;
        //this.countLines(fileDisplay);
        let promise = new Promise<CSVData>((resolve, reject) => {
            let data = new CSVData();
            const config: ParseConfig = {
                header: true,
                dynamicTyping: true,
                //preview: 20, // For Testing
                worker: false, // async? may need to keep this false to force synchronous
                skipEmptyLines: true,
                /*step: (results: ParseResult<any>, parser: Parser) => {
                    if (this.columns == null) {
                        this.columns = results.meta.fields;
                    }
                    // TODO: change this to extract the laps
                    this.parsed.push(results.data);
                    fileDisplay.parsed++;
                    fileDisplay.progress = fileDisplay.parsed / fileDisplay.parseLength * 100;
                    if (fileDisplay.parsed === 304351) {
                        console.log("End.");
                    }
                },*/
                //Can only use one of step or complete:
                complete: (results: ParseResult<any>, file: File) => {
                    data.parsed = results.data;
                    data.columns = results.meta.fields.map(header => new Column(header));
                    data.columns.unshift(new Column("Time (s)"));
                    
                    let headers = results.meta.fields.join(",");
                    if (headers.indexOf("Manifold pressure") >= 0 && headers.indexOf("Barometric pressure") >= 0) {
                        data.columns.push(new Column("Boost (kPa) *OBD"));
                    }
                    //data.columns.forEach(column => this.columnMap.set(column.name, column));
                    /*for(let row of this.parsed) {
                        for (let header of Object.keys(row)) {
                            let column = this.columnMap.get(header);
                            if(!column.isExport && row[header] != null && typeof row[header] !== "undefined" && row[header] !== "") {
                                column.isExport = true;
                                console.log("Setting header to true", header, row, column);
                            }
                        }
                    }*/
                    console.log("Parsing complete:", results, data);
                    resolve(data);
                },
                error: (error: ParseError, file: File) => {
                    console.log("Error:", error);
                    reject(error);
                },
                beforeFirstChunk: (chunk: string) : string => {
                    let dataChunk = this.ignoreProlog(chunk).replace("Time (s)", "UTC Time (s)");
                    let headers = dataChunk.slice(0, dataChunk.indexOf('\n')).split(",");
                    let headerCounts = new Map<string, number>();
                    headers.forEach((header: string, index: number) => {
                        if(headerCounts.has(header)) {
                            headerCounts.set(header, headerCounts.get(header) + 1);
                            dataChunk = this.replaceSecond(dataChunk, header + ",", header + " (" + headerCounts.get(header) + "),");
                        } else {
                            headerCounts.set(header, 1);
                        }
                    });

                    return dataChunk;
                }
            };

            parse(file, config);
        });

        return promise;
    }

    /**
     * 
     * @param text Incoming chunk of data (or potentially the whole file)
     * @returns 
     */
    private ignoreProlog(text: string): string {
        const pattern: string = text.indexOf('\r\n') > 0 ? '\r\n\r\n' : '\n\n';
        var index = text.indexOf(pattern);
        return index > 0 ? text.substring(index + pattern.length) : text;
    }

    /**
     * Replace the second instance of the header with an extra value so that data doesn't get overwritten during parsing.
     * @param text 
     * @param header 
     * @param replacement 
     * @returns 
     */
    private replaceSecond(text: string, header: string, replacement: string) : string {
        var index = text.indexOf(header, text.indexOf(header) + header.length);
        return text.substr(0, index) + replacement + text.substr(index + header.length);
    }
}