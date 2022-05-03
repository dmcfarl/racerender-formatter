import { parse, ParseConfig, ParseError, Parser, ParseResult } from 'papaparse';
import { Column } from './column';
import { CSVData } from './csvdata';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CSVReaderService {

    public async extract(file: File): Promise<CSVData> {
        let promise = new Promise<CSVData>((resolve, reject) => {
            let data = new CSVData();
            data.filename = file.name;
            /*const config: ParseConfig = {
                header: true,
                dynamicTyping: true,
                //preview: 20, // For Testing
                worker: false, // async? may need to keep this false to force synchronous
                skipEmptyLines: true,
                //Can only use one of step or complete:
                complete: (results: ParseResult<any>, file: File) => {
                    data.parsed = results.data;
                    data.columns = results.meta.fields.map(header => new Column(header));
                    data.columns.unshift(new Column("Time (s)"));

                    let headers = results.meta.fields.join(",");
                    if (headers.indexOf("Manifold pressure") >= 0 && headers.indexOf("Barometric pressure") >= 0) {
                        data.columns.push(new Column("Boost (kPa) *OBD"));
                    }
                    console.log("Parsing complete:", results, data);
                    resolve(data);
                },
                error: (error: ParseError, file: File) => {
                    console.log("Error:", error);
                    reject(error);
                },
                beforeFirstChunk: (chunk: string): string => {
                    let dataChunk = this.ignoreProlog(chunk).replace("Time (s)", "UTC Time (s)").replace("Speed (m/s)", "GPS Speed (m/s)");

                    let headers = dataChunk.slice(0, dataChunk.indexOf('\n')).split(",");
                    let headerCounts = new Map<string, number>();

                    // Replace any duplicates
                    headers.forEach((header: string) => {
                        if (headerCounts.has(header)) {
                            headerCounts.set(header, headerCounts.get(header) + 1);
                            dataChunk = this.replaceSecond(dataChunk, header + ",", header + " (" + headerCounts.get(header) + "),");
                        } else {
                            headerCounts.set(header, 1);
                        }
                    });

                    return dataChunk;
                }
            };*/
            data.parsed = [];
            const config: ParseConfig = {
                header: true,
                dynamicTyping: true,
                //preview: 20, // For Testing
                worker: false, // async? may need to keep this false to force synchronous; Doesn't seem to work with beforeFirstChunk
                skipEmptyLines: true,
                step: (results: ParseResult<any>, parser: Parser) => {
                    data.parsed.push(results.data);
                },
                complete: () => {
                    console.log("Parsing complete");
                    resolve(data);
                },
                error: (error: ParseError, file: File) => {
                    console.log("Error:", error);
                    reject(error);
                },
                beforeFirstChunk: (chunk: string): string => {
                    let dataChunk = this.ignoreProlog(chunk).replace("Time (s)", "UTC Time (s)").replace("Speed (m/s)", "GPS Speed (m/s)");

                    let headers = dataChunk.slice(0, dataChunk.indexOf('\n')).trim().split(",");
                    let headerCounts = new Map<string, number>();

                    // Replace any duplicates
                    headers.forEach((header: string) => {
                        if (headerCounts.has(header)) {
                            headerCounts.set(header, headerCounts.get(header) + 1);
                            dataChunk = this.replaceSecond(dataChunk, header + ",", header + " (" + headerCounts.get(header) + "),");
                        } else {
                            headerCounts.set(header, 1);
                        }
                    });
                    if (headers.findIndex(header => header.startsWith("Manifold pressure")) >= 0 && headers.findIndex(header => header.startsWith("Barometric pressure")) >= 0) {
                        headers.push("Boost (kPa) *OBD");
                    }
                    headers.unshift("Time (s)");
                    data.columns = headers.map(header => new Column(header));

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
    private replaceSecond(text: string, header: string, replacement: string): string {
        var index = text.indexOf(header, text.indexOf(header) + header.length);
        return text.substr(0, index) + replacement + text.substr(index + header.length);
    }
}