import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LapsComposerStepComponent } from './laps-composer-step.component';

describe('LapsComposerStepComponent', () => {
  let component: LapsComposerStepComponent;
  let fixture: ComponentFixture<LapsComposerStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LapsComposerStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LapsComposerStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
