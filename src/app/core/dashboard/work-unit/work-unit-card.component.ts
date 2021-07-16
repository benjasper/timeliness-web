import { Component, Input, OnInit } from '@angular/core'
import { Task, TaskUnwound } from 'src/app/models/task'
import { DurationUnit, Duration } from 'src/app/models/duration'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'
import { animate, style, transition, trigger } from '@angular/animations'

@Component({
	selector: 'app-work-unit-card',
	templateUrl: './work-unit-card.component.html',
	styleUrls: ['./work-unit-card.component.scss'],
	animations: [
		trigger('appear', [
			transition(':enter', [style({ opacity: 0 }), animate(200)]),
			transition(':leave', [animate(200, style({ opacity: 0 }))]),
		]),
	],
})
export class WorkUnitCardComponent extends TaskComponent implements OnInit {
	constructor(private taskService: TaskService) {
		super()
	}

	progress = 0

	public today = new Date()
	@Input() task!: Task
	@Input() workUnitIndex!: number

	ngOnInit(): void {
		if (!this.task || this.workUnitIndex) {
			throw Error('Missing required arguments!')
		}

		this.progress = this.getWorkUnitProgress(new Date())

		setInterval(() => {
			this.progress = this.getWorkUnitProgress(new Date())
		}, 1000)

		this.taskService.now.subscribe((date) => {
			this.today = date
		})
	}

	public getWorkUnitProgress(now: Date): number {
		const start = this.task.workUnits[this.workUnitIndex].scheduledAt.date.start.toDate().getTime()
		if (start > now.getTime()) {
			return 0
		}

		const end = this.task.workUnits[this.workUnitIndex].scheduledAt.date.end.toDate().getTime()

		const progressInMiliseconds = end - now.getTime()

		if (end < now.getTime() || progressInMiliseconds <= 0) {
			return 100
		}

		const duration = end - start

		const progress = 100 - (progressInMiliseconds / duration) * 100

		return progress
	}

	public markWorkUnitAsDone(task: Task, workUnitIndex: number, done = true): void {
		this.taskService.markWorkUnitAsDone(task, workUnitIndex, done).subscribe()
	}

	public rescheduleWorkUnit(task: Task): void {
		this.taskService.rescheduleWorkUnit(task, this.workUnitIndex).subscribe()
	}
}
