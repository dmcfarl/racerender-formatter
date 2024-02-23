import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFormatterStepComponent } from './upload-formatter-step.component';

describe('UploadFormatterStepComponent', () => {
  let component: UploadFormatterStepComponent;
  let fixture: ComponentFixture<UploadFormatterStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadFormatterStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFormatterStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
