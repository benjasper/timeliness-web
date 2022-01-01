import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { Task } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'
import { animate, style, transition, trigger } from '@angular/animations'
import { Tag } from 'src/app/models/tag'
import { ModalService } from 'src/app/services/modal.service'
import { Toast, ToastType } from 'src/app/models/toast'
import { ReschedulingModalComponent } from '../../modals/rescheduling-modal/rescheduling-modal.component'

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
	constructor(private taskService: TaskService, private modalService: ModalService) {
		super()
	}

	progress = 0

	tag?: Tag

	public today = new Date()
	@Input() task!: Task
	@Input() workUnitIndex!: number
	@Input() small = false
	@Input() loading = false

	@ViewChild('reschedulingModal', { static: false }) reschedulingModal!: ReschedulingModalComponent

	ngOnInit(): void {
		if (this.loading) {
			return
		}

		if ((this.task === undefined || this.workUnitIndex === undefined) && this.loading === false) {
			throw Error('Missing required arguments!')
		}

		if (this.task.tags[0]) {
			this.taskService.tagsObservable.subscribe((newTags) => {
				const foundTag = newTags.find((x) => x.id === this.task.tags[0])
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
		const observable = this.taskService.markWorkUnitAsDone(task, workUnitIndex, done)

		let message = 'Work unit marked as done'
		if (done === false) {
			message = 'Work unit marked as un-done'
		}

		const toast = new Toast(ToastType.Success, message)
		toast.loading = observable.toPromise()
		this.modalService.addToast(toast)

		observable.subscribe(
			() => {
				this.loading = false
			},
			() => {
				this.loading = false
			}
		)
	}

	public rescheduleWorkUnit(task: Task): void {
		this.modalService
			.addModal(ReschedulingModalComponent, { task: task, workUnitIndex: this.workUnitIndex })
			.subscribe((result) => {
				if (!result.hasValue) {
					return
				}

				this.loading = true
				if (result.result.length === 0) {
					const observable = this.taskService.rescheduleWorkUnit(task, this.workUnitIndex)
					observable.subscribe(
						() => {
							this.loading = false
						},
						() => {
							this.loading = false
						}
					)
					
					const toast = new Toast(ToastType.Success, 'Work unit rescheduled')
					toast.loading = observable.toPromise()
					this.modalService.addToast(toast)
				} else {
					const observable = this.taskService.rescheduleWorkUnitWithTimespans(
						task,
						this.workUnitIndex,
						result.result
					)
					observable.subscribe(
						() => {
							this.loading = false
						},
						() => {
							this.loading = false
						}
					)

					const toast = new Toast(ToastType.Success, 'Work unit rescheduled')
					toast.loading = observable.toPromise()
					this.modalService.addToast(toast)
				}
			})
		return
	}
}
