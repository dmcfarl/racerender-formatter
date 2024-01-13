import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFormatterStepComponent } from './edit-formatter-step.component';

describe('EditFormatterStepComponent', () => {
  let component: EditFormatterStepComponent;
  let fixture: ComponentFixture<EditFormatterStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFormatterStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFormatterStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
