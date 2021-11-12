import { Component, Input, OnInit } from '@angular/core'
import { Task, TaskUnwound } from 'src/app/models/task'
import { DurationUnit, Duration } from 'src/app/models/duration'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'
import { animate, style, transition, trigger } from '@angular/animations'
import { Tag } from 'src/app/models/tag'
import { HttpErrorResponse } from '@angular/common/http'
import { ApiError } from 'src/app/models/error'
import { ToastService } from 'src/app/services/toast.service'
import { ToastType } from 'src/app/models/toast'

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
	constructor(private taskService: TaskService, private toastService: ToastService) {
		super()
	}

	progress = 0

	tag?: Tag

	public today = new Date()
	@Input() task!: Task
	@Input() workUnitIndex!: number
	@Input() small = false
	@Input() loading = false

	ngOnInit(): void {
		if (this.loading) {
			return
		}
		
		if ((this.task === undefined || this.workUnitIndex === undefined) && this.loading === false) {
			throw Error('Missing required arguments!')
		}

		if (this.task.tags[0]) {
			this.taskService.tagsObservable.subscribe(newTags => {
				const foundTag = newTags.find(x => x.id === this.task.tags[0])
				if (foundTag) {
					this.tag = foundTag
				}
			})
		}

		this.progress = this.task.workUnits[this.workUnitIndex].isDone ? 100 : this.getWorkUnitProgress(new Date())

		if (!this.task.workUnits[this.workUnitIndex].isDone) {
			setInterval(() => {
				this.progress = this.getWorkUnitProgress(new Date())
			}, 1000)
		}

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
		this.loading = true
		this.taskService.markWorkUnitAsDone(task, workUnitIndex, done).subscribe(() => {
			let message = "Workunit marked as done"
			if (done === false) {
				message = "Workunit marked as un-done"
			}

			this.toastService.newToast(ToastType.Success, message)
		}, undefined, () => {
			this.loading = false
		})
	}

	public rescheduleWorkUnit(task: Task): void {
		this.loading = true
		this.taskService.rescheduleWorkUnit(task, this.workUnitIndex).subscribe(() => {
			this.toastService.newToast(ToastType.Success, "Workunit rescheduled")
		}, undefined,
		() => {
			this.loading = false
		})
	}
}
