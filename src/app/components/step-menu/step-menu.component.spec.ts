import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepMenuComponent } from './step-menu.component';

describe('StepMenuComponent', () => {
  let component: StepMenuComponent;
  let fixture: ComponentFixture<StepMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
