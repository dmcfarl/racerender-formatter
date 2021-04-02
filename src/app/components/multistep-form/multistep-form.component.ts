import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { DataConverter, Conversion, DataTransformer } from 'src/app/components/multistep-form/transform/dataconverter';
import { CSVReaderService } from 'src/app/components/multistep-form/reader/csvreader.service';
import { Column } from 'src/app/components/multistep-form/column';
import { CSVData } from 'src/app/components/multistep-form/reader/csvdata';
import { LapReaderService } from './reader/lapreader.service';
import { Lap, Race } from './race';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.scss']
})
export class MultistepFormComponent implements OnInit {
  @ViewChild("stepper", { static: false }) stepper: MatStepper;

  isExtracting: boolean = false;
  data: CSVData;
  race: Race;

  conversions = DataConverter.conversions;
  transforms = DataTransformer.transforms;
  columnSelectColumns: string[] = ['isExport','column','conversion','transform'];
  columnsForm: FormGroup;
  lapSelectColumns: string[] = ['isExport','id','time','sector'];//,'penalty'];
  lapForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.columnsForm = this._formBuilder.group({
      columns: ['', Validators.required]
    });
    this.lapForm = this._formBuilder.group({
      laps: ['', Validators.required]
    });
  }

  reset(): void {
    this.stepper.reset();
  }

  next(): void {
    // Use setTimeout here to get the stepper to recognize that the upload has ended.
    /*setTimeout(() => {
        this.stepper.next();
    }, 1);*/
    let x;
  }

  saveColumnSelection() {
    this.data.columns = this.columnsForm.value;
  }
  saveLapSelection() {
    this.race.laps = this.lapForm.value;
  }
  
  /**
   * on file drop handler
   */
  onFileDropped($event) {
    if (this.data == null || this.data.parsed.length > 0) {
      this.extract($event);
    }
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: Array<any>) {
    this.extract(files);
  }
  
  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
   extract(files: Array<File>) {
    // for (const file of files) {
    //   const item = new FileDisplay(file);
    //   item.progress = 0;
    //   this.files.push(item);
    //   this.extract(item);
    // }
    // this.fileDropEl.nativeElement.value = "";
    // // this.uploadFilesSimulator(0);
    if (files.length > 1) {
      alert("Only one file can be parsed at a time. Parsing first file.");
    } else if (files.length <= 0) {
      alert("Need a file to parse!");
      return;
    }
    
    this.isExtracting = true;
    new CSVReaderService().extract(files[0]).then((data) => {
      this.data = data;
      this.columnsForm.setControl('columns', new FormArray(this.data.columns.map(Column.asFormGroup)));
      this.isExtracting = false;
      new LapReaderService().extract(this.data.parsed).then((race) => {
        this.race = race;
        this.lapForm.setControl('laps', new FormArray(this.race.laps.map(Lap.asFormGroup)));
      });
      // Use setTimeout here to get the stepper to recognize that the upload has ended.
      setTimeout(() => {
        this.stepper.next();
      }, 1);
    });
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.columnSelection.selected.length;
    // const numRows = this.csvColumns.controls.length;
    // return numSelected === numRows;
    return false;
  }

  isSomeSelected() {
    let someSelected = false;
    for (let column in this.columnsForm.value.columns) {
      someSelected = this.columnsForm.value.columns[column].isExport;
      if (someSelected) {
        break;
      }
    }

    return someSelected;
  }

  /** Selects all rows if they are not all selected; otherwise clear columnSelection. */
  masterToggle() {
    // this.isAllSelected() ?
    //     this.columnSelection.clear() :
    //     this.csvColumns.controls.forEach(column => this.columnSelection.select(column));
  }

  get csvColumns(): FormArray {
    return this.columnsForm.get('columns') as FormArray;
  }

  get laps(): FormArray {
    return this.lapForm.get('laps') as FormArray;
  }

  lapSectors(lapIndex: number) : FormArray {
    return this.laps.at(lapIndex).get("sectors") as FormArray;
  }
}
