import { Component, OnInit } from '@angular/core';
import { RaceService } from '../../../../services/race.service';
import { RaceWriterService } from '../../../../services/racewriter.service';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-download-composer-step',
  templateUrl: './download-composer-step.component.html',
  styleUrls: ['./download-composer-step.component.css']
})
export class DownloadComposerStepComponent implements OnInit {
  isWriting: boolean = false;

  constructor(private raceService: RaceService, private router: Router, private raceWriterService: RaceWriterService) { }

  ngOnInit(): void {
    if (this.raceService.race == null) {
      this.router.navigate(['composer/laps-step']);
    }
  }

  onDownload() {
    this.isWriting = true;

    this.raceWriterService.write().then((content: Blob) => {
      this.isWriting = false;
      FileSaver.saveAs(content, 'ComposerDataFile.zip');
    });
  }

  prevPage() {
    this.router.navigate(['composer/laps-step']);
  }
}
