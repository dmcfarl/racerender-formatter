import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Penalty, PenaltyType, Sector, Session } from '../../../../models';
import { Rounder } from '../../../../services/rounder.service';
import { RaceService } from '../../../../services/race.service';
import { SessionTransformService } from '../../../../services/sessiontransform.service';

@Component({
  selector: 'app-laps-formatter-step',
  templateUrl: './laps-formatter-step.component.html',
  styleUrls: ['./laps-formatter-step.component.css']
})
export class LapsFormatterStepComponent implements OnInit {
  lapSelect: string = "bestGhost";

  selectedSessions: Session[];
  expandedSessions = {};

  constructor(public raceService: RaceService, private router: Router, private sessionTransformService: SessionTransformService) { }

  ngOnInit(): void {
    if (this.raceService.race == null) {
      this.router.navigate(['formatter/upload-step']);
    }
    this.expandedSessions = {};
    this.raceService.race.sessions.forEach(session => (this.expandedSessions[session.sessionNum] = true));
    this.selectBestAndPrevious();
  }

  get sessions(): Session[] {
    return this.raceService.race.sessions;
  }

  get penaltyTypes(): PenaltyType[] {
    return Penalty.penaltyTypes;
  }

  get best(): Lap {
    return this.raceService.race.best;
  }

  nextPage() {
    this.raceService.race.sessions.forEach((session: Session) => {
      session.isExport = this.selectedSessions.indexOf(session) >= 0;
      if (session.isExport) {
        this.sessionTransformService.transformSession(session);
      }
    });
    this.raceService.race.allLaps.forEach((lap: Lap) => lap.overlay = null);
    if (this.selectedSessions.length > 0) {
      this.router.navigate(['formatter/edit-step']);
    }
  }

  prevPage() {
    this.router.navigate(['formatter/columns-step']);
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
    this.raceService.race.allLaps.forEach(lap => {
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
    this.raceService.race.allLaps.forEach(lap => {
      if (lap.sectors.length > 1) {
        lap.sectors.splice(i, 1);
        lap.sectors[i].sector = Rounder.round(lap.sectors[i].split - (i > 0 ? lap.sectors[i - 1].split : 0), 3);
      }
    });
  }

  selectBestAndPrevious() {
    this.selectedSessions = [];
    this.raceService.race.sessions.forEach(session => {
      if (session.laps.includes(this.raceService.race.best) || session.laps.includes(this.raceService.race.best.previousBest)) {
        this.selectedSessions.push(session);
      }
    });
  }
}
