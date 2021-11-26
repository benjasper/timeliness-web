import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessGoogleComponent } from './success-google.component';

describe('SuccessGoogleComponent', () => {
  let component: SuccessGoogleComponent;
  let fixture: ComponentFixture<SuccessGoogleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessGoogleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessGoogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
