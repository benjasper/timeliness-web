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

	constructor(private taskService: TaskService) {}

	ngOnInit(): void {
		this.taskService.tasksUnwoundObservalble.subscribe((workUnits) => {
			if (!workUnits) {
				return
			}

			this.lastWorkUnitsUpdate = workUnits
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
