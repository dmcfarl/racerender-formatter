import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadStepComponent } from './download-step.component';

describe('DownloadStepComponent', () => {
  let component: DownloadStepComponent;
  let fixture: ComponentFixture<DownloadStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
