import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.css']
})
export class MultistepFormComponent implements OnInit {
  uploadFileFormGroup: FormGroup;
  columnsFormGroup: FormGroup;
  conversionsFormGroup: FormGroup;
  preciseFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.uploadFileFormGroup = this._formBuilder.group({
      uploadCtrl: ['', Validators.required]
    });
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

}
