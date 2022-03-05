import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleErrorComponent } from './google-error.component';

describe('GoogleErrorComponent', () => {
  let component: GoogleErrorComponent;
  let fixture: ComponentFixture<GoogleErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
