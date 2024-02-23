import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadFormatterStepComponent } from './download-formatter-step.component';

describe('DownloadStepComponent', () => {
  let component: DownloadFormatterStepComponent;
  let fixture: ComponentFixture<DownloadFormatterStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadFormatterStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadFormatterStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
