import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaDateGroupItemComponent } from './agenda-date-group-item.component';

describe('AgendaDateGroupItemComponent', () => {
  let component: AgendaDateGroupItemComponent;
  let fixture: ComponentFixture<AgendaDateGroupItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgendaDateGroupItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaDateGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
