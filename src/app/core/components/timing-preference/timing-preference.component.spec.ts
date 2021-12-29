import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimingPreferenceComponent } from './timing-preference.component';

describe('TimingPreferenceComponent', () => {
  let component: TimingPreferenceComponent;
  let fixture: ComponentFixture<TimingPreferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimingPreferenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimingPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
