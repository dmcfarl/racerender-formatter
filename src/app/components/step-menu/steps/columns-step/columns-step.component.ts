import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Column } from 'src/app/components/multistep-form/column';
import { DataConverter, DataTransformer } from 'src/app/components/multistep-form/transform/dataconverter';
import { RaceService } from 'src/app/services/race.service';

@Component({
  selector: 'app-columns-step',
  templateUrl: './columns-step.component.html',
  styleUrls: ['./columns-step.component.css']
})
export class ColumnsStepComponent implements OnInit {
  
  conversions = DataConverter.conversions;
  transforms = DataTransformer.transforms;

  selectedColumns: Column[];

  constructor(public raceService: RaceService, private router: Router) { }

  ngOnInit(): void {
    if (this.raceService.csvData == null) {
      this.router.navigate(['upload-step']);
    }
    this.selectedColumns = this.raceService.csvData.columns.filter(column => column.isExport);
  }

  get columns(): Column[] {
    return this.raceService.csvData.columns;
  }
}