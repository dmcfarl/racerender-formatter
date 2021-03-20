import { MatStepper } from '@angular/material/stepper';
import { parse, ParseConfig, ParseError, Parser, ParseResult } from 'papaparse';
import { FileDisplay } from '../models/file-display';

export class Extractor {
    parsed: Object[] = [];
    headers: string[] = null;
    stepper: MatStepper;

    /*constructor(fileDisplay: FileDisplay) {
        this.extract(fileDisplay);
    }*/
    constructor(file: File, stepper: MatStepper) {
        this.stepper = stepper;
        this.extract(file);
    }

    public getHeaders(): string[] {
        return this.headers;
    }

    private extract(file: File /*fileDisplay: FileDisplay*/): any {
        //fileDisplay.parsed = 0;
        //this.countLines(fileDisplay);
        this.parsed = [];
        const config: ParseConfig = {
            header: true,
            //preview: 20, // For Testing
            worker: false, // async? may need to keep this false to force synchronous
            skipEmptyLines: true,
            /*step: (results: ParseResult<any>, parser: Parser) => {
                if (this.headers == null) {
                    this.headers = results.meta.fields;
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
                console.log("Parsing complete:", results, file);
                // Use setTimeout here to get the stepper to recognize that the upload has ended.
                setTimeout(() => {
                    this.stepper.next();
                }, 1);
            },
            error: (error: ParseError, file: File) => {
                console.log("Error:", error);
            },
            beforeFirstChunk: (chunk: string) => {
                return this.ignoreProlog(chunk);
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
}