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

	today = new Date()
	public groupedDeadlines: TaskDateGroup[] = []
	public groupedUpcoming: TaskUnwoundDateGroup[] = []
	public deadlines: Task[] = []
	public nextUp: TaskUnwound[] = []
	public upcoming: TaskUnwound[] = []

	ngOnInit(): void {
		this.loadDeadlines()
		this.loadTasksByWorkunits()
	}

	public async loadDeadlines(): Promise<void> {
		this.taskService.getTasksByDeadlines().subscribe({
			next: (response) => {
				response.results.forEach((task) => {
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
			},
		})
	}

	public async loadTasksByWorkunits(): Promise<void> {
		this.taskService.getTasksByWorkunits().subscribe({
			next: (response) => {
				response.results.forEach((task) => {
					if (
						task.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) <=
						this.today.setHours(0, 0, 0, 0)
					) {
						this.nextUp.push(task)
						return
					}

					if (
						this.groupedUpcoming[this.groupedUpcoming.length - 1] &&
						this.groupedUpcoming[this.groupedUpcoming.length - 1].date.getMonth() ===
							task.workUnit.scheduledAt.date.start.toDate().getMonth()
					) {
						this.groupedUpcoming[this.groupedUpcoming.length - 1].tasks.push(task)
						return
					}

					const dateGroup = new TaskUnwoundDateGroup()
					dateGroup.date = task.workUnit.scheduledAt.date.start.toDate()
					dateGroup.tasks.push(task)
					this.groupedUpcoming.push(dateGroup)
				})
			},
		})
	}

	public getNextUpMessage(): string {
		if (this.nextUp.length > 0) {
			const notDoneTasks = this.nextUp.filter((task) => task.isDone === false)

			if (notDoneTasks.length === 0) {
				return 'All done for today'
			}
		}

		if (this.nextUp.length === 0) {
			return 'No tasks for today!'
		}

		return 'Next up'
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
