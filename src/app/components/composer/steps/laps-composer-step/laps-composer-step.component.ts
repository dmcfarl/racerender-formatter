import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lap, Penalty, PenaltyType, Sector, Session } from '../../../../models';
import { Rounder } from '../../../../services/rounder.service';
import { RaceService } from '../../../../services/race.service';

@Component({
  selector: 'app-laps-composer-step',
  templateUrl: './laps-composer-step.component.html',
  styleUrls: ['./laps-composer-step.component.css']
})
export class LapsComposerStepComponent implements OnInit {

  selectedSessions: Session[];
  expandedSessions = {};

  constructor(
    public raceService: RaceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.raceService.importEmitter.subscribe(() => this.initializeTable());
    if (this.raceService.race == null) {
      this.raceService.initializeRace();
      this.raceService.race.sessionBuffer = 0;
      this.raceService.convertToAbsoluteTime();
    }
    this.initializeTable();
  }

  set lapSelect(lapSelect: string) {
    this.raceService.race.lapSelect = lapSelect;
  }

  get lapSelect(): string {
    return this.raceService.race.lapSelect;
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

  initializeTable(): void {
    this.updateBestLap();
    if (this.lapSelect === 'all') {
      this.selectAll();
    } else if (this.lapSelect === 'bestGhost') {
      this.selectBestAndPrevious();
    } else {
      this.selectedSessions = this.raceService.race.sessions.filter((session: Session) => session.isExport);
    }
    this.expandedSessions = {};
    this.raceService.race.sessions.forEach((session: Session) => (this.expandedSessions[session.sessionNum] = true));
  }

  nextPage() {
    this.raceService.convertToRelativeTime();

    let lapNum = 1;
    let sessionNum = 1;
    this.raceService.race.sessions.forEach((session: Session) => {
      session.isExport = this.selectedSessions.indexOf(session) >= 0;

      let anyValid = false;
      session.laps.forEach((lap: Lap) => {
        if (lap.isInvalid) {
          lap.displayId = -lapNum;
        } else {
          anyValid = true;
          lap.displayId = lapNum;
          lapNum++;
        }
      });

      if (!anyValid) {
        session.sessionNum = -sessionNum;
      } else {
        session.sessionNum = sessionNum;
        sessionNum++;
      }
    });
    this.raceService.race.allLaps.forEach((lap: Lap) => lap.overlay = null);
    if (this.selectedSessions.length > 0) {
      this.router.navigate(['composer/download-step']);
    }
  }

  updateBestLap() {
    this.raceService.updateBestLap();
    if (this.lapSelect === 'bestGhost') {
      this.selectBestAndPrevious();
    }
  }

  addSession() {
    const session = this.raceService.addSession();
    if (this.lapSelect === 'all') {
      this.selectAll();
    }
    this.expandedSessions[session.sessionNum] = true;
  }

  removeSession(toRemove: Session) {
    this.raceService.removeSession(toRemove);
  }

  addLap(session: Session) {
    this.raceService.addLap(session);
  }

  removeLap(session: Session, lap: Lap) {
    this.raceService.removeLap(session, lap);
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
        sector.split = lastSector.split;
        sector.sector = lastSector.sector;
        lastSector.sector = 0;
        lap.sectors.splice(lap.sectors.length - 1, 0, sector);
      } else {
        let sector = new Sector();
        sector.split = lap.lapTime;
        sector.sector = lap.lapTime;
        lap.sectors.push(sector);
      }
    });
  }

  removeSector(i: number) {
    this.raceService.race.allLaps.forEach(lap => {
      if (lap.sectors.length > 1 && i < lap.sectors.length) {
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

  selectAll() {
    this.selectedSessions = [...this.raceService.race.sessions];
  }
}
