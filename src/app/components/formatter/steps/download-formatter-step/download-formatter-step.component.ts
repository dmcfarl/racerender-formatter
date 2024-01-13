import { Component, OnInit } from '@angular/core';
import { RaceService } from 'src/app/services/race.service';
import { RaceWriterService } from '../../../../services/racewriter.service';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-download-formatter-step',
  templateUrl: './download-formatter-step.component.html',
  styleUrls: ['./download-formatter-step.component.css']
})
export class DownloadFormatterStepComponent implements OnInit {
  isWriting: boolean = false;

  constructor(private raceService: RaceService, private router: Router, private raceWriterService: RaceWriterService) { }

  ngOnInit(): void {
    if (this.raceService.race == null) {
      this.router.navigate(['formatter/columns-step']);
    }
  }

  onDownload() {
    this.isWriting = true;

    this.raceWriterService.write().then((content: Blob) => {
      this.isWriting = false;
      FileSaver.saveAs(content, this.raceService.csvData.filename.replace(/csv$/i, "zip"));
    });
  }

  prevPage() {
    this.router.navigate(['formatter/edit-step']);
  }
}
