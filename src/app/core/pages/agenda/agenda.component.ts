import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Task, TaskAgenda, TaskUnwound } from 'src/app/models/task'
import { AgendaEventType } from 'src/app/models/event'
import { TaskService } from 'src/app/services/task.service'
import { UtilityService } from 'src/app/services/utility.service'
import { forkJoin, pipe } from 'rxjs'
import { share } from 'rxjs/operators'
import { Title } from '@angular/platform-browser'
import { PageComponent } from 'src/app/pages/page'
import { NavigationEnd, Router } from '@angular/router'

@Component({
	selector: 'app-agenda',
	templateUrl: './agenda.component.html',
})
export class AgendaComponent extends PageComponent implements OnInit, OnDestroy {
	constructor(private taskService: TaskService, protected titleService: Title, private router: Router) {
		super(titleService)
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
	loadingPast = false
	pastPreloaded = false

	totalPagesFuture = 0
	totalPagesPast = 0

	onPastPageLoaded = new EventEmitter<boolean>()
	onFuturePageLoaded = new EventEmitter<boolean>()

	syncInterval?: NodeJS.Timeout

	@ViewChild('todayElement') todayElement!: ElementRef
	@ViewChild('scrollContainer') scrollContainerElement!: ElementRef

	ngOnInit(): void {
		this.setTitle('Agenda')

		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd && event.url.endsWith('/agenda')) {
				this.setTitle('Agenda')
			}
		})

		this.fetchAgendaFuture(0)

		this.taskService.dateChangeObservable.subscribe((newDate) => {
			this.today = newDate
			this.fetchAgendaFuture(0)
			this.fetchTasksPast(0)
		})

		this.taskService.tasksObservable.subscribe(() => {
			this.fetchAgendaFuture(0)
			this.fetchTasksPast(0)
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

	public fetchAgendaFuture(page: number) {
		if (page === 0) {
			this.groupedTasksFuture = []
		}

		this.taskService.getAgenda(this.today, 1, page).subscribe(
			(tasks) => {
				this.groupedTasksFuture.push(...this.groupTasks(tasks.results))
				this.totalPagesFuture = tasks.pagination.pages
				this.dateYears = UtilityService.checkIfYearNeedsToBeShown(
					this.groupedTasksFuture.map((group) => group.date),
					this.today
				)
				const todaysGroups = this.groupedTasksFuture.filter((x) => x.date.isSameDay(this.today))

				this.hasTasksToday = todaysGroups.length > 0
				this.loading = false

				this.onFuturePageLoaded.emit(true)
			},
			() => {
				this.loading = false
				this.onFuturePageLoaded.emit(false)
			}
		)
	}

	public fetchTasksPast(page: number): Promise<void> {
		if (this.loadingPast) {
			return Promise.resolve()
		}

		if (page === 0) {
			this.pastPreloaded = true
			this.groupedTasksPast = []
		}

		this.loadingPast = true
		return new Promise((resolve, reject) => {
			this.taskService.getAgenda(this.today, -1, page).subscribe(
				(tasks) => {
					this.totalPagesPast = tasks.pagination.pages
					this.groupedTasksPast.push(...this.groupTasks(tasks.results.reverse()))

					this.loadingPast = false
					this.onPastPageLoaded.emit(true)
					resolve()
				},
				() => {
					this.loadingPast = false
					this.onPastPageLoaded.emit(false)
					reject()
				}
			)
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

		return groupedTasks
	}

	public async showPastTasks() {
		this.tasksPastClicked = true
		setTimeout(() => {
			this.todayElement.nativeElement.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'start' })
		}, 0)
	}
}

export class TaskAgendaDateGroup {
	tasks: TaskAgenda[] = []
	date!: Date
}
