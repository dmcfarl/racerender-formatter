import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Extractor } from 'src/app/classes/extractor';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.scss']
})
export class MultistepFormComponent implements OnInit {
  @ViewChild("stepper", { static: false }) stepper: MatStepper;

  extractor: Extractor;

  columnsSelected = false;
  columnsFormGroup: FormGroup;
  conversionsFormGroup: FormGroup;
  preciseFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.columnsFormGroup = this._formBuilder.group({
      columnsCtrl: ['', Validators.required]
    });
    this.conversionsFormGroup = this._formBuilder.group({
      conversionsCtrl: ['', Validators.required]
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
  
  /**
   * on file drop handler
   */
  onFileDropped($event) {
    if (this.extractor == null || this.extractor.parsed.length > 0) {
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
      alert("Only one file can be parsed at a time.");
      this.extractor = new Extractor(files[0], this);
    } else if (files.length === 1) {
      this.extractor = new Extractor(files[0], this);
    }
  }
}
