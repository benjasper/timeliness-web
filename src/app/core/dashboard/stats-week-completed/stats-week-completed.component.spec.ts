import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsWeekCompletedComponent } from './stats-week-completed.component';

describe('StatsWeekCompletedComponent', () => {
  let component: StatsWeekCompletedComponent;
  let fixture: ComponentFixture<StatsWeekCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsWeekCompletedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsWeekCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
