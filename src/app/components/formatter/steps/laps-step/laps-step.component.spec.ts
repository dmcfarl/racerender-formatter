import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LapsStepComponent } from './laps-step.component';

describe('LapsStepComponent', () => {
  let component: LapsStepComponent;
  let fixture: ComponentFixture<LapsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LapsStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LapsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
