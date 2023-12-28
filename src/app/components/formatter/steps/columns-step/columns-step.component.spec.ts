import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsStepComponent } from './columns-step.component';

describe('ColumnsStepComponent', () => {
  let component: ColumnsStepComponent;
  let fixture: ComponentFixture<ColumnsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnsStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
