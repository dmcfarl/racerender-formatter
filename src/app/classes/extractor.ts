import { FormArray } from '@angular/forms';
import { parse, ParseConfig, ParseError, Parser, ParseResult } from 'papaparse';
import { MultistepFormComponent } from '../components/multistep-form/multistep-form.component';
import { Column } from '../models/column';


export class Extractor {
    parsed: Object[] = [];
    columns: Column[] = null;
    columnMap = new Map<string, Column>();
    multistepForm: MultistepFormComponent;

    /*constructor(fileDisplay: FileDisplay) {
        this.extract(fileDisplay);
    }*/
    constructor(file: File, multistepForm: MultistepFormComponent) {
        this.multistepForm = multistepForm;
        this.extract(file);
    }

    private extract(file: File /*fileDisplay: FileDisplay*/): any {
        //fileDisplay.parsed = 0;
        //this.countLines(fileDisplay);
        this.parsed = [];
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
                this.parsed = results.data;
                this.columns = results.meta.fields.map(header => new Column(header));
                this.columns.forEach(column => this.columnMap.set(column.name, column));
                /*for(let row of this.parsed) {
                    for (let header of Object.keys(row)) {
                        let column = this.columnMap.get(header);
                        if(!column.export && row[header] != null && typeof row[header] !== "undefined" && row[header] !== "") {
                            column.export = true;
                            console.log("Setting header to true", header, row, column);
                        }
                    }
                }*/
                console.log("Parsing complete:", results, this.columns);
                // Use setTimeout here to get the stepper to recognize that the upload has ended.
                setTimeout(() => {
                    let ctrl = this.multistepForm.columnsFormGroup.get('columnsCtrl');
                    ctrl.setValue(results.meta.fields);
                    this.multistepForm.stepper.next();
                }, 1);
            },
            error: (error: ParseError, file: File) => {
                console.log("Error:", error);
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