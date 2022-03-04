import { trigger, transition, style, animate } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
import { modalFlyInOut } from 'src/app/animations'
import { Duration, DurationUnit } from 'src/app/models/duration'
import { Task } from 'src/app/models/task'
import { ModalResult } from 'src/app/services/modal.service'

export interface MarkDoneModalData {
	task: Task
	workUnitIndex: number
}

export interface MarkDoneResult {
	timeLeft: Duration
}

@Component({
	selector: 'app-mark-done-modal',
	templateUrl: './mark-done-modal.component.html',
	animations: [
		trigger('inOut', [
			transition(':enter', [style({ opacity: 0 }), animate(200)]),
			transition(':leave', [style({ opacity: 0.5 }), animate(200)]),
		]),
		modalFlyInOut
	],
})
export class MarkDoneModalComponent
	extends SimpleModalComponent<MarkDoneModalData, ModalResult<MarkDoneResult>>
	implements OnInit, MarkDoneModalData
{
	task!: Task
	workUnitIndex!: number
	isOpen = false
	result: ModalResult<MarkDoneResult> = new ModalResult({ timeLeft: new Duration(0) }, false)
	selectedDuration: number = 0

	times: number[] = []
	isModeAfterEnd = false

	ngOnInit(): void {
		this.isOpen = true

		let timeLeft = MarkDoneModalComponent.calculateTimeLeft(this.task, this.workUnitIndex)

		if (this.task.workUnits[this.workUnitIndex].scheduledAt.date.end.toDate().getTime() < new Date().getTime()) {
			this.isModeAfterEnd = true

			timeLeft = this.task.workUnits[this.workUnitIndex].workload.toDuration(
				DurationUnit.Nanoseconds
			).milliseconds
			if (timeLeft - 60000 * 5 > 0) {
				timeLeft -= 60000 * 5
			}
		}

		let durationPointer = 0
		
		while (durationPointer < timeLeft) {
			durationPointer += 60000 * 5
			this.times.push(durationPointer)
		}

		let selectedIndex = Math.round((this.times.length - 1) / 2)

		if (!this.isModeAfterEnd) {
			selectedIndex = this.times.length - 1
		}

		this.selectedDuration = this.times[selectedIndex]

		if (!this.isModeAfterEnd) {
			while (
				durationPointer < this.task.workUnits[this.workUnitIndex].workload / 1e6 &&
				durationPointer < this.selectedDuration + 60000 * 30
			) {
				durationPointer += 60000 * 5
				this.times.push(durationPointer)
			}
		}
	}

	// Calculates time left for the given work unit and returns it as milliseconds
	static calculateTimeLeft(task: Task, workUnitIndex: number): number {
		const now = new Date()
		return task.workUnits[workUnitIndex].scheduledAt.date.end.toDate().getTime() - now.getTime()
	}

	close(): Promise<any> {
		this.isOpen = false
		return super.close()
	}

	apply(markDone = false) {
		if (markDone) {
			this.result = new ModalResult({ timeLeft: new Duration(0) }, true)
		} else {
			this.result = new ModalResult({ timeLeft: new Duration(this.selectedDuration) }, true)
		}
		this.close()
	}

	newDuration(duration: number) {
		return duration.toDuration(DurationUnit.Milliseconds)
	}

	newDateMinusDuration(date: Date, duration: number) {
		return new Date(date.getTime() - duration)
	}
}
