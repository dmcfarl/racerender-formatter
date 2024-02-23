import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Column } from '../../../../models/column.model';
import { DataConverter, DataTransformer } from '../../../../services/dataconverter.service';
import { RaceService } from '../../../../services/race.service';
import { Rounder } from '../../../../services/rounder.service';

@Component({
  selector: 'app-columns-formatter-step',
  templateUrl: './columns-formatter-step.component.html',
  styleUrls: ['./columns-formatter-step.component.css']
})
export class ColumnsFormatterStepComponent implements OnInit {

  conversions = DataConverter.conversions;
  transforms = DataTransformer.transforms;
  roundOptions = Rounder.roundOptions;

  selectedColumns: Column[];

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
    if (this.raceService.csvData == null) {
      this.router.navigate(['formatter/upload-step']);
    } else {
      this.selectedColumns = this.raceService.csvData.columns.filter(column => column.isExport);
    }
  }

  get columns(): Column[] {
    return this.raceService.csvData.columns;
  }

  nextPage() {
    this.raceService.csvData.columns.forEach(column => {
      column.isExport = this.selectedColumns.includes(column);
    });

    if (this.raceService.csvData.columns.some(column => column.isExport)) {
      this.router.navigate(['formatter/laps-step']);
    }
  }

  prevPage() {
    this.router.navigate(['formatter/upload-step']);
  }
}
