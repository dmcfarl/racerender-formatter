import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTextBoxComponent } from './timetextbox.component';

describe('TimeTextBoxComponent', () => {
  let component: TimeTextBoxComponent;
  let fixture: ComponentFixture<TimeTextBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeTextBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
