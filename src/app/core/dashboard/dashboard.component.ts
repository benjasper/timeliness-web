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

	ngOnInit(): void {
		this.taskService.now.subscribe((date) => {
			this.today = date
		})

		this.groupTasks(this.taskService.tasks)
		this.taskService.tasksObservalble.subscribe((tasks) => {
			if (!tasks) {
				this.groupedDeadlines = []
				return
			}
			this.groupTasks(tasks)
		})

		this.groupTasksUnwound(this.taskService.tasksUnwound)
		this.taskService.tasksUnwoundObservalble.subscribe((tasks) => {
			if (!tasks) {
				this.nextUp = []
				this.groupedUpcoming = []
				return
			}
			this.groupTasksUnwound(tasks)
		})
	}

	public getNextUpMessage(): string {
		if (this.nextUp.length > 0) {
			const notDoneTasks = this.nextUp.filter((task) => task.isDone === false)

			if (notDoneTasks.length === 0) {
				return 'All done for today'
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

			if (notDoneTasks[0].workUnitsIndex === notDoneTasks[0].workUnitsCount - 1) {
				return `Did you finish ${notDoneTasks[0].name}?`
			}

			if (notDoneTasks[0].workUnit.scheduledAt.date.start.toDate() > this.today) {
				return `Next up: ${notDoneTasks[0].name} at ${notDoneTasks[0].workUnit.scheduledAt.date.start
					.toDate()
					.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}`
			}

			return `Did you successfully work on ${notDoneTasks[0].name}?`
		}

		if (this.nextUp.length === 0) {
			return 'No tasks for today!'
		}

		return 'Next up'
	}

	private groupTasks(tasks: Task[]): void {
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
		const nextWeek = this.today.addDays(7).getWeekNumber(true)

		tasks.forEach((task) => {
			const now = new Date(this.today)
			if (task.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) <= now.setHours(0, 0, 0, 0)) {
				this.nextUp.push(task)
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
}

class TaskDateGroup {
	tasks: Task[] = []
	date!: Date
}

class TaskUnwoundDateGroup {
	tasks: TaskUnwound[] = []
	date!: Date
}
