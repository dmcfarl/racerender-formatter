import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RaceService } from 'src/app/components/formatter/race.service';

@Component({
  selector: 'app-upload-step',
  templateUrl: './upload-step.component.html',
  styleUrls: ['./upload-step.component.css']
})
export class UploadStepComponent implements OnInit {
  isExtracting: boolean = false;

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
  }

  onUpload(event) {
    this.isExtracting = true;
    this.raceService.extractData(event.files[0]).then(data => {
      this.isExtracting = false;
      this.router.navigate(['formatter/columns-step']);
    });
  }

  nextPage() {
    if (this.raceService.csvData != null) {
      this.router.navigate(['formatter/columns-step']);
    }
  }

}
