import { Component, OnInit } from '@angular/core';
import { Task, TaskAgenda, TaskUnwound } from 'src/app/models/task';
import { AgendaEventType } from 'src/app/models/event';
import { TaskService } from 'src/app/services/task.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
	selector: 'app-agenda',
	templateUrl: './agenda.component.html',
	styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {

	constructor(private taskService: TaskService) {
		this.today.setHours(0,0,0,0)
	 }

	list: Array<TaskUnwound | Task> = []

	groupedTasksFuture: TaskAgendaDateGroup[] = []
	groupedTasksPast: TaskAgendaDateGroup[] = []

	AGENDA_TYPE = AgendaEventType

	today = new Date()
	dateYears = new Map<Number, Number[]>()
	tasksPastClicked = false

	ngOnInit(): void {
		this.taskService.getAgenda(this.today, 1).subscribe(tasks => {
			this.groupedTasksFuture = this.groupTasks(tasks.results)
		})
	}

	private groupTasks(tasks: TaskAgenda[]): TaskAgendaDateGroup[] {
		const groupedTasks: TaskAgendaDateGroup[] = []

		tasks.forEach((task) => {
			if (
				groupedTasks[groupedTasks.length - 1] &&
				groupedTasks[groupedTasks.length - 1].date.setHours(0, 0, 0, 0) ===
				task.date.date.start.toDate().setHours(0, 0, 0, 0)
			) {
				groupedTasks[groupedTasks.length - 1].tasks.push(task)
				return
			}

			const dateGroup = new TaskAgendaDateGroup()
			dateGroup.date = task.date.date.start.toDate()
			dateGroup.tasks.push(task)
			groupedTasks.push(dateGroup)
		})

		this.dateYears = UtilityService.checkIfYearNeedsToBeShown(groupedTasks.map(group => group.date), this.today)

		return groupedTasks;
	}

	public showPastTasks() {
		this.tasksPastClicked = true
		this.taskService.getAgenda(this.today, -1).subscribe(tasks => {
			console.log(tasks)
			this.groupedTasksPast = this.groupTasks(tasks.results.reverse())
		})
	}
}

class TaskAgendaDateGroup {
	tasks: TaskAgenda[] = []
	date!: Date
}
