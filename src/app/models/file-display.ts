export class FileDisplay {
    file: File;
    progress = 0;
    parsed = 0;
    parseLength = -1;

    constructor(file: File) { 
        this.file = file; 
    }
}