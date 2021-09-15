import { Component, OnInit } from '@angular/core'
import { Task, TaskUnwound } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	constructor(private taskService: TaskService) {}

	public today = new Date()
	public groupedDeadlines: TaskDateGroup[] = []
	public groupedUpcoming: TaskUnwoundDateGroup[] = []
	public nextUp: TaskUnwound[] = []

	private tasks: Task[] = []
	private tasksUnwound: TaskUnwound[] = []

	static pageSizeTasks = 10
	static pageSizeTasksUnwound = 10

	public loadingTasks = true
	public loadingWorkUnits = true
	public deadlinesCollapsed = false

	ngOnInit(): void {
		this.taskService.now.subscribe((date) => {
			this.today = date
		})

		this.taskService.dateChangeObservable.subscribe(() => {
			this.groupTasks(this.tasks)
			this.groupTasksUnwound(this.tasksUnwound)
		})

		this.taskService.getTasksByDeadlines().subscribe((response) => {
			this.tasks = response.results
			this.groupTasks(response.results)
			this.loadingTasks = false
		})

		this.taskService.getTasksByWorkunits().subscribe((response) => {
			this.tasksUnwound = response.results
			this.groupTasksUnwound(response.results)
			this.loadingWorkUnits = false
		})

		// Register for task updates update tasks and unwound
		this.taskService.tasksObservable.subscribe((task) => {
			this.recevieTaskUpdate(task)
			this.recevieTaskUnwoundUpdate(task)
		})
	}

	private recevieTaskUpdate(task: Task) {
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
		this.taskService.getTasksByDeadlines().subscribe((newTasks) => {
			this.tasks = newTasks.results
			this.groupTasks(this.tasks)
			this.loadingTasks = false
		})
	}

	private recevieTaskUnwoundUpdate(task: Task) {
		// TODO we can optimize this, eg by checking if the new task should be displayed
		// If not refetch them
		const unwoundTasks = this.taskService.taskToUnwound(task)

		this.tasksUnwound = this.tasksUnwound.filter(x => x.id !== task.id)

		this.tasksUnwound.push(...unwoundTasks)

		this.tasksUnwound.sort((a,b) => {
			return a.workUnit.scheduledAt.date.start.toDate().getTime() - b.workUnit.scheduledAt.date.start.toDate().getTime()
		})

		const offset = this.tasksUnwound.length - DashboardComponent.pageSizeTasksUnwound
		if (offset > 0) {
			this.tasksUnwound.splice(DashboardComponent.pageSizeTasksUnwound - 1, offset)
		}

		this.groupTasksUnwound(this.tasksUnwound)
	}

	public getNextUpMessage(): string {
		if (this.nextUp.length > 0) {
			const notDoneTasks = this.nextUp.filter((task) => task.workUnit.isDone === false)

			if (notDoneTasks.length === 0) {
				return 'All done for today!'
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
				return `Currently working on ${notDoneTasks[found].name}`
			}

			if (notDoneTasks[0].workUnit.scheduledAt.date.start.toDate() > this.today) {
				return `Next up: ${notDoneTasks[0].name} at ${notDoneTasks[0].workUnit.scheduledAt.date.start
					.toDate()
					.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}`
			}

			if (notDoneTasks[0].workUnitsIndex === notDoneTasks[0].workUnitsCount - 1) {
				return `Did you finish ${notDoneTasks[0].name}?`
			}

			return `Did you successfully work on ${notDoneTasks[0].name}?`
		}

		if (this.nextUp.length === 0) {
			return 'No tasks for today!'
		}

		return 'Next up'
	}

	private groupTasks(tasks: Task[]): void {
		this.groupedDeadlines = [];

		tasks.forEach((task) => {
			if (
				this.groupedDeadlines[this.groupedDeadlines.length - 1] &&
				this.groupedDeadlines[this.groupedDeadlines.length - 1].date.setHours(0, 0, 0, 0) ===
					task.dueAt.date.start.toDate().setHours(0, 0, 0, 0)
			) {
				this.groupedDeadlines[this.groupedDeadlines.length - 1].tasks.push(task)
				return
			}

			const dateGroup = new TaskDateGroup()
			dateGroup.date = task.dueAt.date.start.toDate()
			dateGroup.tasks.push(task)
			this.groupedDeadlines.push(dateGroup)
		})
	}

	private groupTasksUnwound(tasks: TaskUnwound[]): void {
		this.groupedUpcoming = [];
		this.nextUp = [];

		const nextWeek = this.today.addDays(7).getWeekNumber(true)

		tasks.forEach((task) => {
			const now = new Date(this.today)
			if (
				task.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0) ||
				task.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) <= now.setHours(0, 0, 0, 0) && !task.workUnit.isDone
			) {
				this.nextUp.push(task)
				return
			} else if (task.workUnit.isDone) {
				return
			}

			if (this.groupedUpcoming[this.groupedUpcoming.length - 1]) {
				if (
					(this.groupedUpcoming[this.groupedUpcoming.length - 1].date.getWeekNumber(true) ===
						task.workUnit.scheduledAt.date.start.toDate().getWeekNumber(true) &&
						task.workUnit.scheduledAt.date.start.toDate().getWeekNumber(true) <= nextWeek) ||
					(this.groupedUpcoming[this.groupedUpcoming.length - 1].date.getMonth() ===
						task.workUnit.scheduledAt.date.start.toDate().getMonth() &&
						this.groupedUpcoming[this.groupedUpcoming.length - 1].date.getWeekNumber(true) > nextWeek)
				) {
					this.groupedUpcoming[this.groupedUpcoming.length - 1].tasks.push(task)
					return
				}
			}

			const dateGroup = new TaskUnwoundDateGroup()
			dateGroup.date = task.workUnit.scheduledAt.date.start.toDate()
			dateGroup.tasks.push(task)
			this.groupedUpcoming.push(dateGroup)
		})
	}

	public getStartsAtWorkUnit() {
		const startIndex = this.nextUp.findIndex((x) => x.workUnit.isDone === false)
		return startIndex === -1 ? 0 : startIndex
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
