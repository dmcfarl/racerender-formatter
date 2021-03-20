import { parse, ParseConfig, ParseError, Parser, ParseResult } from 'papaparse';
import { FileDisplay } from '../models/file-display';

export class Extractor {
    parsed: Object[] = [];
    headers: string[] = null;

    constructor(fileDisplay: FileDisplay) {
        this.extract(fileDisplay);
    }

    public getHeaders(): string[] {
        return this.headers;
    }

    private extract(fileDisplay: FileDisplay): any {
        fileDisplay.parsed = 0;
        this.countLines(fileDisplay);
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
            complete: (results, file) => {
              console.log("Parsing complete:", results, file);
            },
            error: (error: ParseError, file: File) => {
                console.log("Error:", error);
            },
            beforeFirstChunk: (chunk: string) => {
                return this.ignoreProlog(chunk);
            }
        };

        parse(fileDisplay.file, config);
    }

    private countLines(fileDisplay: FileDisplay) {
        const reader = new FileReader();
        reader.onload = () => {
            const match = this.ignoreProlog(reader.result.toString()).match(/(\r?\n)+/g);
            // Don't count header
            fileDisplay.parseLength = match.length - 1;
            fileDisplay.progress = fileDisplay.parsed / fileDisplay.parseLength * 100;
        };
        reader.readAsText(fileDisplay.file);
        // const stream = file.stream();
        // const reader = stream.getReader();
        // reader.read().
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