import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RaceService } from 'src/app/services/race.service';

@Component({
  selector: 'app-upload-step',
  templateUrl: './upload-step.component.html',
  styleUrls: ['./upload-step.component.css']
})
export class UploadStepComponent implements OnInit {

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
  }

}
