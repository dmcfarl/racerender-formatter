import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsFormatterStepComponent } from './columns-formatter-step.component';

describe('ColumnsFormatterStepComponent', () => {
  let component: ColumnsFormatterStepComponent;
  let fixture: ComponentFixture<ColumnsFormatterStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnsFormatterStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsFormatterStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
