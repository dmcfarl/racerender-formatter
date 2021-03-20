import { Component, ElementRef, ViewChild } from '@angular/core';
import { parse, ParseConfig, ParseError, Parser, ParseResult } from 'papaparse';
import { Extractor } from './classes/extractor';
import { FileDisplay } from './models/file-display';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'racerender-formatter';
  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: FileDisplay[] = [];

  parsed: Object[] = [];
  extractor: Extractor;

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: Array<any>) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.files[index].progress < 100) {
      console.log("Upload in progress.");
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    // setTimeout(() => {
    //   if (index === this.files.length) {
    //     return;
    //   } else {
    //     const progressInterval = setInterval(() => {
    //       if (this.files[index].progress === 100) {
    //         clearInterval(progressInterval);
    //         this.uploadFilesSimulator(index + 1);
    //       } else {
    //         this.files[index].progress += 5;
    //       }
    //     }, 200);
    //   }
    // }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<File>) {
    for (const file of files) {
      const item = new FileDisplay(file);
      item.progress = 0;
      this.files.push(item);
      this.extract(item);
    }
    this.fileDropEl.nativeElement.value = "";
    // this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  public extract(file: any): Extractor {
    return new Extractor(file, null);
  }
}
