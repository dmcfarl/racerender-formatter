import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { DataConverter, Conversion } from 'src/app/classes/dataconverter';
import { ExtractorService } from 'src/app/services/extractor.service';
import { Column } from 'src/app/models/column';
import { CSVData } from 'src/app/models/csvdata';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.scss']
})
export class MultistepFormComponent implements OnInit {
  @ViewChild("stepper", { static: false }) stepper: MatStepper;

  isExtracting: boolean = false;
  data: CSVData;

  conversions = DataConverter.conversions;
  columnSelectColumns: string[] = ['isExport','column','conversion'];
  columnsForm: FormGroup;
  preciseFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.columnsForm = this._formBuilder.group({
      columns: ['', Validators.required]
    });
    this.preciseFormGroup = this._formBuilder.group({
      preciseCtrl: ['', Validators.required]
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
    ExtractorService.extract(files[0]).then((data) => {
      this.data = data;
      this.columnsForm.setControl('columns', new FormArray(this.data.columns.map(Column.asFormGroup)));
      this.isExtracting = false;
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
}
