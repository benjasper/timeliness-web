import { Component, Input, OnInit } from '@angular/core';
import { AgendaEventType } from 'src/app/models/event';
import { TaskService } from 'src/app/services/task.service';
import { TaskAgendaDateGroup } from '../agenda.component';

@Component({
  selector: 'app-agenda-date-group-item',
  templateUrl: './agenda-date-group-item.component.html',
  styleUrls: ['./agenda-date-group-item.component.scss']
})
export class AgendaDateGroupItemComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  @Input() group!: TaskAgendaDateGroup
  @Input() today!: Date
  @Input() dateYears = new Map<Number, Number[]>()
  @Input() AGENDA_TYPE = AgendaEventType

  now = new Date()

  ngOnInit(): void {
    this.taskService.now.subscribe(now => {
      this.now = now
    })
  }

}
