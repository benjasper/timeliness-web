import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkUnitComponent } from './work-unit.component';

describe('WorkUnitComponent', () => {
  let component: WorkUnitComponent;
  let fixture: ComponentFixture<WorkUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkUnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
