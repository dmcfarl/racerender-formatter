import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TimeReference } from 'src/app/models';
import { RaceService } from 'src/app/services/race.service';

@Component({
  selector: 'app-upload-formatter-step',
  templateUrl: './upload-formatter-step.component.html',
  styleUrls: ['./upload-formatter-step.component.css']
})
export class UploadFormatterStepComponent implements OnInit {
  isExtracting: boolean = false;

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
  }

  onUpload(event) {
    this.isExtracting = true;
    this.raceService.timeReference = TimeReference.RELATIVE;
    this.raceService.extractData(event.files[0]).then(data => {
      this.isExtracting = false;
      if (this.raceService.race != null) {
        this.raceService.race.sessionBuffer = 15;
      }
      this.router.navigate(['formatter/columns-step']);
    });
  }

  nextPage() {
    if (this.raceService.csvData != null) {
      this.router.navigate(['formatter/columns-step']);
    }
  }

}
