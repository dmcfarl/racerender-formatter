import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Sector } from 'src/app/components/multistep-form/race';
import { RaceService } from 'src/app/services/race.service';

@Component({
  selector: 'app-laps-step',
  templateUrl: './laps-step.component.html',
  styleUrls: ['./laps-step.component.css']
})
export class LapsStepComponent implements OnInit {

  selectedLaps: Lap[];

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
    if (this.raceService.race == null) {
      this.router.navigate(['columns-step']);
    }
    this.selectedLaps = [this.raceService.race.best, this.raceService.race.best.previousBest];
  }

  get laps(): Lap[] {
    return this.raceService.race.laps;
  }

  nextPage() {
    this.raceService.race.laps.forEach(lap => {
      lap.isExport = this.selectedLaps.includes(lap);
    });

    if (this.raceService.race.laps.some(lap => lap.isExport)) {
      this.router.navigate(['download-step']);
    }
  }

  prevPage() {
      this.router.navigate(['columns-step']);
  }

  updateBestLap() {
    this.raceService.updateBestLap();
  }

  updateSectors(lap: Lap) {
    this.raceService.updateSectors(lap);
  }
}
