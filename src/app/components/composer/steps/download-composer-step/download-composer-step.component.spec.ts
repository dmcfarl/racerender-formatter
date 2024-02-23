import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadComposerStepComponent } from './download-composer-step.component';

describe('DownloadComposerStepComponent', () => {
  let component: DownloadComposerStepComponent;
  let fixture: ComponentFixture<DownloadComposerStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadComposerStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadComposerStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
