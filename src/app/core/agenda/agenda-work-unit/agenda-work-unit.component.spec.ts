import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaWorkUnitComponent } from './agenda-work-unit.component';

describe('AgendaWorkUnitComponent', () => {
  let component: AgendaWorkUnitComponent;
  let fixture: ComponentFixture<AgendaWorkUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgendaWorkUnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaWorkUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
