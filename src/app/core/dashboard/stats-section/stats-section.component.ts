import { Component, OnInit } from '@angular/core'
import { TaskUnwound } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'

@Component({
	selector: 'app-stats-section',
	templateUrl: './stats-section.component.html',
	styleUrls: ['./stats-section.component.scss'],
})
export class StatsSectionComponent implements OnInit {
	now = new Date()
	workUnitsCompleted: number = 0
	workUnitsToComplete: number = 0

	lastWorkUnitsUpdate: TaskUnwound[] = []

	loadingPlan = false

	constructor(private taskService: TaskService) {}

	ngOnInit(): void {
		this.loadingPlan = true

		this.taskService.getTasksByWorkunits().subscribe((result) => {
			if (result.pagination.resultCount === 0) {
				return
			}

			this.lastWorkUnitsUpdate = result.results
			this.computePlanToday()
			this.loadingPlan = false
		})

		this.taskService.tasksObservable.subscribe((task) => {
			const today = new Date(this.now)

			const unwounds = this.taskService
				.taskToUnwound(task)
				.filter(
					(x) =>
						x.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)
				)

			this.lastWorkUnitsUpdate = this.lastWorkUnitsUpdate.filter((x) => x.id !== task.id)

			if (unwounds.length > 0) {
				this.lastWorkUnitsUpdate.push(...unwounds)
			}

			this.computePlanToday()
		})

		this.taskService.dateChangeObservable.subscribe(() => {
			this.computePlanToday()
		})
	}

	computePlanToday() {
		const todaysWorkUnits = this.lastWorkUnitsUpdate.filter((x) => {
			return x.workUnit.scheduledAt.date.start.toDate().setHours(0, 0, 0, 0) <= this.now.setHours(0, 0, 0, 0)
		})

		this.workUnitsToComplete = todaysWorkUnits.length
		this.workUnitsCompleted = todaysWorkUnits.filter((x) => x.workUnit.isDone === true).length
	}
}
