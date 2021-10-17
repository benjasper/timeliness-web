import { Component, Input, OnInit } from '@angular/core';
import { AgendaEventType } from 'src/app/models/event';
import { TaskAgendaDateGroup } from '../agenda.component';

@Component({
  selector: 'app-agenda-date-group-item',
  templateUrl: './agenda-date-group-item.component.html',
  styleUrls: ['./agenda-date-group-item.component.scss']
})
export class AgendaDateGroupItemComponent implements OnInit {

  constructor() { }

  @Input() group!: TaskAgendaDateGroup
  @Input() today!: Date
  @Input() dateYears = new Map<Number, Number[]>()
  @Input() AGENDA_TYPE = AgendaEventType

  ngOnInit(): void {
  }

}
