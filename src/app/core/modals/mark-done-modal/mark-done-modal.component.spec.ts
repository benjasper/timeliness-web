import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkDoneModalComponent } from './mark-done-modal.component';

describe('MarkDoneModalComponent', () => {
  let component: MarkDoneModalComponent;
  let fixture: ComponentFixture<MarkDoneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkDoneModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkDoneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
