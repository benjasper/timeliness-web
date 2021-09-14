import { Component, OnInit } from '@angular/core';
import { Task, TaskUnwound } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
	selector: 'app-agenda',
	templateUrl: './agenda.component.html',
	styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {

	constructor(private taskService: TaskService) { }

	list: Array<TaskUnwound | Task> = []

	ngOnInit(): void {
		
	}

	public generateList() {
		this.list.sort((a,b) => {
			let date1: Date
			let date2: Date

			const c = a as TaskUnwound
			if (c.workUnitsIndex) {
				date1 = c.workUnit.scheduledAt.date.start.toDate()
			} else {
				date1 = c.dueAt.date.start.toDate()
			}

			const d = b as TaskUnwound
			if (c.workUnitsIndex) {
				date2 = d.workUnit.scheduledAt.date.start.toDate()
			} else {
				date2 = d.dueAt.date.start.toDate()
			}


			return date1.getTime() < date2.getTime() ? -1 : 1
		})

		console.log(this.list)
	}
}
