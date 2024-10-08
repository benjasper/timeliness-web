import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { Task, TaskUnwound } from 'src/app/models/task'
import { User } from 'src/app/models/user'
import { PageComponent } from 'src/app/pages/page'
import { AuthService } from 'src/app/services/auth.service'
import { TaskService } from 'src/app/services/task.service'
import { UtilityService } from 'src/app/services/utility.service'
import { Filter } from '../../components/filter/filter.component'

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends PageComponent implements OnInit, OnDestroy {
	constructor(private taskService: TaskService, protected titleService: Title, private router: Router, private authService: AuthService) {
		super(titleService)
	}

	public user?: User

	public today = new Date()
	public groupedDeadlines: TaskDateGroup[] = []
	public groupedUpcoming: TaskUnwoundDateGroup[] = []
	public nextUp: TaskUnwound[] = []

	private tasks: Task[] = []
	private tasksUnwound: TaskUnwound[] = []

	public startIndex = 0

	static pageSizeTasks = 12
	static pageSizeTasksUnwound = 12

	public loadingTasks = true
	public loadingWorkUnits = true
	public loadingNextUp = true
	public deadlinesCollapsed = false

	public nextUpTaskFocus?: TaskUnwound
	public nextUpState: NextUpState = NextUpState.Default
	public eNextUpState = NextUpState

	public deadlineYears = new Map<Number, Number[]>()
	public workUnitYears = new Map<Number, Number[]>()

	public currentWorkUnitsFilter: Filter[] = []
	public currentDeadlinesFilter: Filter[] = []
	public staticWorkUnitsConfig = TaskService.workUnitFilterConfig
	public staticDeadlinesConfig = TaskService.deadlinesFilterConfig

	public syncInterval?: NodeJS.Timeout

	@ViewChild('scrollContainer', { static: true }) scrollContainerWorkUnitElement!: ElementRef
	@ViewChild('scrollContainerTasks', { static: true }) scrollContainerTasksElement!: ElementRef
	totalWorkUnitPages = 0
	onWorkUnitPageLoaded = new EventEmitter<boolean>()

	totalTasksPages = 0
	onTasksPageLoaded = new EventEmitter<boolean>()

	ngOnInit(): void {
		this.setTitle('Dashboard')

		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd && event.url.endsWith('/dashboard')) {
				this.setTitle('Dashboard')
			}
		})

		this.taskService.now.subscribe((date) => {
			this.today = date
			this.checkNextUpMessage()
		})

		this.authService.user.subscribe((user) => {
			this.user = user
			this.checkNextUpMessage()
		})

		this.taskService.dateChangeObservable.subscribe(() => {
			this.groupTasks(this.tasks)
			this.groupTasksUnwound(this.tasksUnwound)
		})

		this.currentDeadlinesFilter = Filter.loadFromLocalStorage('deadlinesFilters')

		// Persistence for do date filter commented out because of dependent next up do dates
		//this.currentWorkUnitsFilter = Filter.loadFromLocalStorage('workUnitsFilters')

		this.loadTasksPage(0)
		this.loadWorkUnitsPage(0)

		// Register for task updates update tasks and unwound
		this.taskService.tasksObservable.subscribe((task) => {
			this.recevieTaskUpdate(task)
			this.recevieTaskUnwoundUpdate(task)
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

	loadWorkUnitsPage(page: number, withNextUp = true){
		this.loadingWorkUnits = true

		if (withNextUp) {
			this.loadingNextUp = true
		}
		
		this.taskService.getTasksByWorkunits(undefined, page, DashboardComponent.pageSizeTasksUnwound, this.currentWorkUnitsFilter).subscribe(
			(response) => {
				this.tasksUnwound.push(...response.results)
				this.totalWorkUnitPages = response.pagination.pages
				this.groupTasksUnwound(this.tasksUnwound, withNextUp)
				this.loadingNextUp = false
				this.loadingWorkUnits = false
				this.onWorkUnitPageLoaded.emit(true)
			},
			() => {
				this.loadingNextUp = false
				this.loadingWorkUnits = false
				this.onWorkUnitPageLoaded.emit(false)
			}
		)
	}

	onDeadlinesFilter(filter: Filter[]) {
		this.currentDeadlinesFilter = filter
		Filter.saveToLocalStorage('deadlinesFilters', filter)
		this.tasks = []
		this.groupedDeadlines = []
		this.loadTasksPage(0)
	}

	onWorkUnitFilter(filter: Filter[]) {
		this.currentWorkUnitsFilter = filter
		//Filter.saveToLocalStorage('workUnitsFilters', filter)
		this.tasksUnwound = []
		this.groupedUpcoming = []
		this.loadWorkUnitsPage(0, false)
	}

	loadTasksPage(page: number) {
		this.loadingTasks = true
		this.taskService.getTasksByDeadlines(undefined, page, DashboardComponent.pageSizeTasks, undefined, this.currentDeadlinesFilter).subscribe(
			(response) => {
				this.totalTasksPages = response.pagination.pages
				this.tasks.push(...response.results)
				this.groupTasks(this.tasks)
				this.loadingTasks = false
				this.onTasksPageLoaded.emit(true)
			},
			() => {
				this.loadingTasks = false
				this.onTasksPageLoaded.emit(false)
			}
		)
	}

	private recevieTaskUpdate(task: Task) {
		if (task.deleted) {
			this.tasks = this.tasks.filter((x) => x.id !== task.id)
			this.groupTasks(this.tasks)
			return
		}

		const found = this.tasks.find((x) => task.id === x.id)

		// If this task is already inside our view, overwrite it
		if (found && found.dueAt.date !== task.dueAt.date) {
			this.tasks = this.tasks.filter((x) => x.id !== task.id)
			this.tasks.push(task)
			this.tasks.sort((a, b) => {
				return a.dueAt.date.start.toDate().getTime() - b.dueAt.date.start.toDate().getTime()
			})
			this.groupTasks(this.tasks)
			return
		} else if (found) {
			const index = this.tasks.indexOf(found)
			this.tasks[index] = task
			this.groupTasks(this.tasks)
			return
		}

		// TODO we can optimize this, eg by checking if the new task should be displayed
		// If not refetch them
		this.loadingTasks = true
		this.taskService.getTasksByDeadlines(undefined, 0, DashboardComponent.pageSizeTasks).subscribe(
			(newTasks) => {
				this.tasks = newTasks.results
				this.groupTasks(this.tasks)
				this.loadingTasks = false
			},
			() => {
				this.loadingTasks = false
			}
		)
	}

	private recevieTaskUnwoundUpdate(task: Task) {
		// TODO we can optimize this, eg by checking if the new task should be displayed
		// If not refetch them
		const unwoundTasks = TaskService.taskToUnwound(task)

		this.tasksUnwound = this.tasksUnwound.filter((x) => x.id !== task.id)

		if (!task.deleted) {
			this.tasksUnwound.push(...unwoundTasks)

			this.tasksUnwound.sort((a, b) => {
				return (
					a.workUnit.scheduledAt.date.start.toDate().getTime() -
					b.workUnit.scheduledAt.date.start.toDate().getTime()
				)
			})

			const offset = this.tasksUnwound.length - DashboardComponent.pageSizeTasksUnwound
			if (offset > 0) {
				this.tasksUnwound.splice(DashboardComponent.pageSizeTasksUnwound + 1, offset)
			}
		}

		this.groupTasksUnwound(this.tasksUnwound)
	}

	public checkNextUpMessage(): void {
		if (this.nextUp.length > 0) {
			const notDoneTasks = this.nextUp.filter((task) => task.workUnit.isDone === false)

			if (notDoneTasks.length === 0) {
				this.nextUpState = NextUpState.Done
				this.nextUpTaskFocus = undefined
				return
			}

			let found = -1
			notDoneTasks.forEach((task, index) => {
				if (
					task.workUnit.scheduledAt.date.start.toDate() < this.today &&
					task.workUnit.scheduledAt.date.end.toDate() > this.today
				) {
					found = index
				}
			})

			if (found !== -1) {
				this.nextUpState = NextUpState.WorkingOn
				this.nextUpTaskFocus = notDoneTasks[found]
				return
			}

			if (notDoneTasks[0].workUnit.scheduledAt.date.start.toDate() > this.today) {
				this.nextUpState = NextUpState.NextTask
				this.nextUpTaskFocus = notDoneTasks[0]
				return
			}

			if (notDoneTasks[0].workUnitsIndex === notDoneTasks[0].workUnitsCount - 1) {
				this.nextUpState = NextUpState.TaskFinish
				this.nextUpTaskFocus = notDoneTasks[0]
				return
			}

			this.nextUpState = NextUpState.WorkUnitFinish
			this.nextUpTaskFocus = notDoneTasks[0]
			return
		}

		if (this.nextUp.length === 0) {
			if (this.user && this.user.createdAt.toDate().isSameDay(this.today)) {
				this.nextUpState = NextUpState.IsNew
				return 
			}
			this.nextUpState = NextUpState.NoTasks
			this.nextUpTaskFocus = undefined
			return
		}

		this.nextUpState = NextUpState.Default
		this.nextUpTaskFocus = undefined
		return
	}

	private groupTasks(tasks: Task[]): void {
		const groupedDeadlines: TaskDateGroup[] = []

		tasks.forEach((task) => {
			if (
				groupedDeadlines[groupedDeadlines.length - 1] &&
				groupedDeadlines[groupedDeadlines.length - 1].date.setHours(0, 0, 0, 0) ===
					task.dueAt.date.start.toDate().setHours(0, 0, 0, 0)
			) {
				groupedDeadlines[groupedDeadlines.length - 1].tasks.push(task)
				return
			}

			const dateGroup = new TaskDateGroup()
			dateGroup.date = task.dueAt.date.start.toDate()
			dateGroup.tasks.push(task)
			groupedDeadlines.push(dateGroup)
		})

		this.deadlineYears = UtilityService.checkIfYearNeedsToBeShown(
			groupedDeadlines.map((group) => group.date),
			this.today
		)

		this.groupedDeadlines = groupedDeadlines
	}

	private groupTasksUnwound(tasks: TaskUnwound[], withNextUp = true): void {
		const nextUp: TaskUnwound[] = []
		const groupedUpcoming: TaskUnwoundDateGroup[] = []

		const nextWeek = this.today.addDays(7).getWeekNumber(true)

		tasks.forEach((task) => {
			const now = new Date(this.today)
			if (
				task.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0) ||
				(task.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) <= now.setHours(0, 0, 0, 0) &&
					!task.workUnit.isDone)
			) {
				nextUp.push(task)
				return
			} else if (task.workUnit.isDone) {
				return
			}

			if (groupedUpcoming[groupedUpcoming.length - 1]) {
				if (
					(groupedUpcoming[groupedUpcoming.length - 1].date.getWeekNumber(true) ===
						task.workUnit.scheduledAt.date.start.toDate().getWeekNumber(true) &&
						task.workUnit.scheduledAt.date.start.toDate().getWeekNumber(true) <= nextWeek) ||
					(groupedUpcoming[groupedUpcoming.length - 1].date.getMonth() ===
						task.workUnit.scheduledAt.date.start.toDate().getMonth() &&
						groupedUpcoming[groupedUpcoming.length - 1].date.getWeekNumber(true) > nextWeek)
				) {
					groupedUpcoming[groupedUpcoming.length - 1].tasks.push(task)
					return
				}
			}

			const dateGroup = new TaskUnwoundDateGroup()
			dateGroup.date = task.workUnit.scheduledAt.date.start.toDate()
			dateGroup.tasks.push(task)
			groupedUpcoming.push(dateGroup)
		})

		this.workUnitYears = UtilityService.checkIfYearNeedsToBeShown(
			groupedUpcoming.map((group) => group.date),
			this.today
		)

		this.groupedUpcoming = groupedUpcoming

		if (withNextUp) {
			this.nextUp = nextUp
		}

		setTimeout(() => {
			this.setStartsAtWorkUnit()
		}, 50)

		this.checkNextUpMessage()
	}

	public setStartsAtWorkUnit() {
		const startIndex = this.nextUp.findIndex((x) => x.workUnit.isDone === false)
		this.startIndex = startIndex === -1 ? 0 : startIndex
	}

	public toggleDeadlines() {
		this.deadlinesCollapsed = !this.deadlinesCollapsed
	}
}

class TaskDateGroup {
	tasks: Task[] = []
	date!: Date
}

class TaskUnwoundDateGroup {
	tasks: TaskUnwound[] = []
	date!: Date
}

enum NextUpState {
	Done,
	WorkingOn,
	TaskFinish,
	WorkUnitFinish,
	NoTasks,
	NextTask,
	Default,
	IsNew,
}
