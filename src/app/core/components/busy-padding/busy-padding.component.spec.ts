import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusyPaddingComponent } from './busy-padding.component';

describe('BusyPaddingComponent', () => {
  let component: BusyPaddingComponent;
  let fixture: ComponentFixture<BusyPaddingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusyPaddingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusyPaddingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
