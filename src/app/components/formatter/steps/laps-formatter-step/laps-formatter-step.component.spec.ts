import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LapsFormatterStepComponent } from './laps-formatter-step.component';

describe('LapsFormatterStepComponent', () => {
  let component: LapsFormatterStepComponent;
  let fixture: ComponentFixture<LapsFormatterStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LapsFormatterStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LapsFormatterStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
