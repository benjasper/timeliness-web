import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkUnitCardComponent } from './work-unit-card.component';

describe('WorkUnitComponent', () => {
  let component: WorkUnitCardComponent;
  let fixture: ComponentFixture<WorkUnitCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkUnitCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkUnitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
