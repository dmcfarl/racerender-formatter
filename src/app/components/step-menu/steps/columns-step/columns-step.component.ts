import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Column } from 'src/app/components/step-menu/reader/column';
import { DataConverter, DataTransformer } from 'src/app/components/step-menu/transform/dataconverter';
import { RaceService } from 'src/app/services/race.service';
import { Rounder } from '../../transform/rounder';

@Component({
  selector: 'app-columns-step',
  templateUrl: './columns-step.component.html',
  styleUrls: ['./columns-step.component.css']
})
export class ColumnsStepComponent implements OnInit {
  
  conversions = DataConverter.conversions;
  transforms = DataTransformer.transforms;
  roundOptions = Rounder.roundOptions;

  selectedColumns: Column[];

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
    if (this.raceService.csvData == null) {
      this.router.navigate(['upload-step']);
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
      this.router.navigate(['laps-step']);
    }
  }

  prevPage() {
      this.router.navigate(['upload-step']);
  }
}
