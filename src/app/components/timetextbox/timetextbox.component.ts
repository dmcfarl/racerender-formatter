import { Component, Input, OnInit, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Rounder } from 'src/app/services/rounder.service';

@Component({
  selector: 'time-textbox',
  templateUrl: './timetextbox.component.html',
  styleUrls: ['./timetextbox.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeTextBoxComponent),
      multi: true,
    }
  ]
})
export class TimeTextBoxComponent implements OnInit, ControlValueAccessor {
  @Input()
  private _seconds: number = 0;

  readonly: boolean = false;

  constructor() { }

  propagateChange = (_: any) => {};

  set value(value: number | string) {
    this._seconds = 0;
    if (typeof value === 'string') {
      const groups = /(([0-9]+):(?=[0-9]+:))?(([0-9]{1,2}):)?([0-9]+([.][0-9]+)?)/.exec(value);

      if (groups[2] != null) {
        // Hours
        this._seconds += 60 * 60 * (+groups[2]);
      }
      if (groups[4] != null) {
        // Minutes
        this._seconds += 60 * (+groups[4]);
      }
      if (groups[5] != null) {
        // Seconds
        this._seconds += (+groups[5]);
      }
    } else if (typeof value === 'number') {
      // Assume this is already in seconds.
      this._seconds = value;
    } else {
      console.log('Unknown type: ' + (typeof value));
    }

    this._seconds = Rounder.round(this._seconds, 3);
    this.propagateChange(this._seconds);
  }

  writeValue(obj: any): void {
    if (obj != null) {
      this.value = obj;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }

  ngOnInit(): void {
  }

}
