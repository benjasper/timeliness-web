import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReschedulingModalComponent } from './rescheduling-modal.component';

describe('ReschedulingModalComponent', () => {
  let component: ReschedulingModalComponent;
  let fixture: ComponentFixture<ReschedulingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReschedulingModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReschedulingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
