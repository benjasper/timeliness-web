import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimespanSelectComponent } from './timespan-select.component';

describe('TimespanSelectComponent', () => {
  let component: TimespanSelectComponent;
  let fixture: ComponentFixture<TimespanSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimespanSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimespanSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
