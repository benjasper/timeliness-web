import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Task, TaskAgenda, TaskUnwound } from 'src/app/models/task';
import { AgendaEventType } from 'src/app/models/event';
import { TaskService } from 'src/app/services/task.service';
import { UtilityService } from 'src/app/services/utility.service';
import { forkJoin, pipe } from 'rxjs';
import { share } from 'rxjs/operators';

@Component({
	selector: 'app-agenda',
	templateUrl: './agenda.component.html',
	styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit, OnDestroy {

	constructor(private taskService: TaskService) {
		this.today.setHours(0, 0, 0, 0)
	}

	list: Array<TaskUnwound | Task> = []

	groupedTasksFuture: TaskAgendaDateGroup[] = []
	groupedTasksPast: TaskAgendaDateGroup[] = []

	AGENDA_TYPE = AgendaEventType

	today = new Date()
	dateYears = new Map<Number, Number[]>()
	tasksPastClicked = false
	hasTasksToday = false
	loading = true

	pageFuture = 0
	pagePast = 0

	syncInterval?: NodeJS.Timeout

	@ViewChild('todayElement') todayElement!: ElementRef

	ngOnInit(): void {
		this.fetchAgenda().subscribe(() => {
			this.loading = false
		}, () => {this.loading = false})

		this.taskService.dateChangeObservable.subscribe((newDate) => {
			this.today = newDate
			this.fetchAgenda()
		})

		this.taskService.tasksObservable.subscribe(() => {
			this.fetchAgenda()
		})

		this.syncInterval = setInterval(() => {
			this.taskService.getTasksByDeadlines(true)
		}, 60000)
	}

	public ngOnDestroy() {
		if (this.syncInterval) {
			clearInterval(this.syncInterval)
		}
	}

	private fetchAgenda() {
		const observable = forkJoin([this.taskService.getAgenda(this.today, 1, this.pageFuture), this.taskService.getAgenda(this.today, -1, this.pagePast)]).pipe(share())

		observable.subscribe(([tasksFuture, tasksPast]) => {
			this.groupedTasksFuture = this.groupTasks(tasksFuture.results)
			this.groupedTasksPast = this.groupTasks(tasksPast.results.reverse())
			this.dateYears = UtilityService.checkIfYearNeedsToBeShown(this.groupedTasksFuture.map(group => group.date), this.today)

			const todaysGroups = this.groupedTasksFuture.filter(x => x.date.isSameDay(this.today))
			todaysGroups.push(...this.groupedTasksPast.filter(x => x.date.isSameDay(this.today)))

			this.hasTasksToday = todaysGroups.length > 0
		})

		return observable
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

		return groupedTasks;
	}

	public showPastTasks() {
		this.tasksPastClicked = true
		setTimeout(() => {
			this.todayElement.nativeElement.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'start' })
		}, 1)
	}
}

export class TaskAgendaDateGroup {
	tasks: TaskAgenda[] = []
	date!: Date
}
