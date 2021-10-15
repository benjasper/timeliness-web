import { Component, OnInit } from '@angular/core';
import { Task, TaskAgenda, TaskUnwound } from 'src/app/models/task';
import { AgendaEventType } from 'src/app/models/event';
import { TaskService } from 'src/app/services/task.service';

@Component({
	selector: 'app-agenda',
	templateUrl: './agenda.component.html',
	styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {

	constructor(private taskService: TaskService) { }

	list: Array<TaskUnwound | Task> = []

	tasksFuture: TaskAgenda[] = []

	AGENDA_TYPE = AgendaEventType

	ngOnInit(): void {
		this.taskService.getAgenda(new Date(), 1).subscribe(tasks => {
			console.log(tasks)
			this.tasksFuture = tasks.results;
		})
	}

	public generateList() {
		
	}
}
