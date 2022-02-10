import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { Task } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'
import { animate, style, transition, trigger } from '@angular/animations'
import { Tag } from 'src/app/models/tag'
import { ModalService } from 'src/app/services/modal.service'
import { Toast, ToastType } from 'src/app/models/toast'
import { ReschedulingModalComponent } from '../../modals/rescheduling-modal/rescheduling-modal.component'
import { Duration } from 'src/app/models/duration'
import { MarkDoneModalComponent } from '../../modals/mark-done-modal/mark-done-modal.component'

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
	tags: Tag[] = []

	public today = new Date()
	@Input() task!: Task
	@Input() workUnitIndex!: number
	@Input() small = false
	@Input() loading = false

	scheduleState: WorkUnitScheduleType = WorkUnitScheduleType.Future
	SCHEDULE_TYPE = WorkUnitScheduleType

	@ViewChild('reschedulingModal', { static: false }) reschedulingModal!: ReschedulingModalComponent

	ngOnInit(): void {
		if (this.loading) {
			return
		}

		if ((this.task === undefined || this.workUnitIndex === undefined) && this.loading === false) {
			throw Error('Missing required arguments!')
		}

		if (this.task.tags && this.task.tags[0]) {
			this.taskService.tagsObservable.subscribe(newTags => {
				this.tags = []
				this.task.tags.forEach(tagId => {
					const foundTag = newTags.find(x => x.id === tagId)
					if (!foundTag) {
						return
					}
					this.tags.push(foundTag)
				})

				this.tag = this.tags[0]
			})
		}

		this.progress = this.task.workUnits[this.workUnitIndex].isDone ? 100 : this.getWorkUnitProgress(new Date())

		if (!this.task.workUnits[this.workUnitIndex].isDone) {
			setInterval(() => {
				this.progress = this.getWorkUnitProgress(new Date())
			}, 1000)
		}

		this.checkIfRightNow()
		this.taskService.now.subscribe((date) => {
			this.today = date

			this.checkIfRightNow()
		})
	}

	private checkIfRightNow(): void {
		if (
			this.task.workUnits[this.workUnitIndex].scheduledAt.date.start.toDate().getTime() <= this.today.getTime() &&
			this.today.getTime() <= this.task.workUnits[this.workUnitIndex].scheduledAt.date.end.toDate().getTime()
		) {
			this.scheduleState = WorkUnitScheduleType.Now
		} else if (
			this.task.workUnits[this.workUnitIndex].scheduledAt.date.start.toDate().getTime() > this.today.getTime()
		) {
			this.scheduleState = WorkUnitScheduleType.Future
		} else {
			this.scheduleState = WorkUnitScheduleType.Past
		}
	}

	public durationToEnd(): string {
		return new Duration(
			Math.abs(
				this.task.workUnits[this.workUnitIndex].scheduledAt.date.end.toDate().getTime() - this.today.getTime()
			)
		).toStringWithoutSeconds()
	}

	public durationToStart(): string {
		return new Duration(
			Math.abs(
				this.task.workUnits[this.workUnitIndex].scheduledAt.date.start.toDate().getTime() - this.today.getTime()
			)
		).toStringWithoutSeconds()
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

	public markWorkUnitAsDone(task: Task, workUnitIndex: number, done = true, partly = false): void {
		const timeLeft = MarkDoneModalComponent.calculateTimeLeft(task, workUnitIndex)

		if (
			!task.workUnits[workUnitIndex].isDone &&
			timeLeft > 5 * 1000 && timeLeft < task.workUnits[workUnitIndex].workload / 1000 &&
			task.workUnits[workUnitIndex].scheduledAt.date.start.toDate().getTime() < this.today.getTime() &&
			task.workUnits[workUnitIndex].scheduledAt.date.end.toDate().getTime() > this.today.getTime() || partly
		) {
			this.modalService.addModal(MarkDoneModalComponent, { task, workUnitIndex }).subscribe((result) => {
				if (!result.hasValue) {
					return
				}

				this.sendWorkUnitDoneRequest(task, workUnitIndex, true, result.result.timeLeft)
			})
			return
		}

		this.sendWorkUnitDoneRequest(task, workUnitIndex, done)

		return
	}

	private sendWorkUnitDoneRequest(task: Task, workUnitIndex: number, done = true, timeLeft = new Duration(0)): void {
		this.loading = true
		const observable = this.taskService.markWorkUnitAsDone(task, workUnitIndex, done, timeLeft)

		let message = 'Work unit marked as done'
		if (done === false) {
			message = 'Work unit marked as not done'
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

export enum WorkUnitScheduleType {
	Past,
	Now,
	Future,
}
