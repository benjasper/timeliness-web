import { trigger, transition, style, animate } from '@angular/animations'
import { Component, Input, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
import { modalFlyInOut } from 'src/app/animations'
import { Duration, DurationUnit } from 'src/app/models/duration'
import { Task } from 'src/app/models/task'
import { Timespan } from 'src/app/models/timespan'
import { ModalResult } from 'src/app/services/modal.service'
import { TaskService } from 'src/app/services/task.service'

export interface ReschedulingModalData {
	task: Task
	workUnitIndex: number
}

@Component({
	selector: 'app-rescheduling-modal',
	templateUrl: './rescheduling-modal.component.html',
	animations: [
		trigger('inOut', [
			transition(':enter', [style({ opacity: 0 }), animate(200)]),
			transition(':leave', [style({ opacity: 0.5 }), animate(200)]),
		]),
		modalFlyInOut
	],
})
export class ReschedulingModalComponent
	extends SimpleModalComponent<ReschedulingModalData, ModalResult<Timespan[]>>
	implements OnInit, ReschedulingModalData
{
	task!: Task
	workUnitIndex!: number
	timespanGroups: Timespan[][] = []

	isOpen = false
	loading = false
	noOptionsAvailable: boolean = false

	result = new ModalResult<Timespan[]>([], false)

	DURATION_UNIT = DurationUnit

	constructor(private taskService: TaskService) {
		super()
	}

	ngOnInit(): void {
		this.isOpen = true

		this.loading = true
		this.taskService.fetchReschedulingSuggestions(this.task, this.task.workUnits[this.workUnitIndex].id).subscribe(
			(timespanGroups) => {
				this.timespanGroups = timespanGroups
				if (timespanGroups.length === 0) {
					this.noOptionsAvailable = true
				}
				this.loading = false
			},
			() => {
				this.loading = false
				this.close()
			}
		)
	}

	close(): Promise<any> {
		this.isOpen = false
		return super.close()
	}

	apply(timespans: Timespan[]): void {
		this.result = new ModalResult(timespans, true)
		this.close()
	}

	timespanToDuration(timespan: Timespan) {
		return Timespan.timespanToDuration(timespan)
	}

	
	isNeighbor(timespan: Timespan) {
		const neighbors = this.task.workUnits.filter(
			(w) =>
				w.id !== this.task.workUnits[this.workUnitIndex].id &&
				(w.scheduledAt.date.start.toDate().getTime() === timespan.end.toDate().getTime() ||
					w.scheduledAt.date.end.toDate().getTime() === timespan.start.toDate().getTime())
		)
		return neighbors.length > 0
	}
}
