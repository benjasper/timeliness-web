import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleCalendarSettingsComponent } from './google-calendar-settings.component';

describe('GoogleCalendarSettingsComponent', () => {
  let component: GoogleCalendarSettingsComponent;
  let fixture: ComponentFixture<GoogleCalendarSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleCalendarSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleCalendarSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
