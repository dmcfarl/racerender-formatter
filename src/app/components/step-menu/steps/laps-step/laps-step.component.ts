import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Penalty, PenaltyType, Sector } from 'src/app/components/step-menu/race';
import { Rounder } from 'src/app/components/step-menu/transform/rounder';
import { RaceService } from 'src/app/services/race.service';

@Component({
  selector: 'app-laps-step',
  templateUrl: './laps-step.component.html',
  styleUrls: ['./laps-step.component.css']
})
export class LapsStepComponent implements OnInit {
  lapSelect: string = "bestGhost";

  selectedLaps: Lap[];
  // penaltyTypes: Object[] = Object.keys(PenaltyType).map(key => ({ label: PenaltyType[key], value: key}));
  // penaltyTypes: PenaltyType[] = [PenaltyType.TIME, PenaltyType.DNF, PenaltyType.OFF, PenaltyType.RERUN];

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
    if (this.raceService.race == null) {
      this.router.navigate(['columns-step']);
    }
    this.selectBestAndPrevious();
  }

  get laps(): Lap[] {
    return this.raceService.race.laps;
  }

  get penaltyTypes(): PenaltyType[] {
    return Penalty.penaltyTypes;
  }

  get best(): Lap {
    return this.raceService.race.best;
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
    if (this.lapSelect === "bestGhost") {
      this.selectBestAndPrevious();
    }
  }

  updateSectors(lap: Lap) {
    this.raceService.updateSectors(lap);
  }

  addPenalty(lap: Lap) {
    lap.penalties.push(new Penalty(this.penaltyTypes[0], 0));
  }

  removePenalty(lap: Lap, i: number) {
    lap.penalties.splice(i, 1);
  }

  addSector() {
    this.raceService.race.laps.forEach(lap => {
      if (lap.sectors.length > 0) {
        let lastSector = lap.sectors[lap.sectors.length - 1];
        let sector = new Sector();
        sector.dataRowIndex = lastSector.dataRowIndex - 1;
        sector.dataRow = this.raceService.csvData.parsed[sector.dataRowIndex];
        sector.split = lastSector.split;
        sector.sector = lastSector.sector;
        lastSector.sector = 0;
        lap.sectors.splice(lap.sectors.length - 1, 0, sector);
      } else {
        let sector = new Sector();
        sector.dataRow = lap.lapFinish;
        sector.dataRowIndex = lap.lapFinishIndex;
        sector.split = lap.lapTime;
        sector.sector = lap.lapTime;
        lap.sectors.push(sector);
      }
    });
  }

  removeSector(i: number) {
    this.raceService.race.laps.forEach(lap => {
      if (lap.sectors.length > 1) {
        lap.sectors.splice(i, 1);
        lap.sectors[i].sector = Rounder.round(lap.sectors[i].split - (lap.sectors.length > 1 ? lap.sectors[lap.sectors.length - 2].split : 0), 3);
      }
    });
  }

  selectBestAndPrevious() {
    this.selectedLaps = [this.raceService.race.best, this.raceService.race.best.previousBest];
  }
}
