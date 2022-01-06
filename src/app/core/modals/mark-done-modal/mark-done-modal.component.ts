import { trigger, transition, style, animate } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
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
		trigger('flyInOut', [
			transition(':enter', [style({ opacity: 0 }), animate(300)]),
			transition(':leave', [animate(300, style({ transform: 'translate(-50%, 150%)', opacity: 0 }))]),
		]),
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

	ngOnInit(): void {
		this.isOpen = true

		const timeLeft = MarkDoneModalComponent.calculateTimeLeft(this.task, this.workUnitIndex)
		let durationPointer = 0

		while (durationPointer < timeLeft) {
			durationPointer += 60000 * 5
			this.times.push(durationPointer)
		}

		this.selectedDuration = this.times[this.times.length - 1]

		while (durationPointer < this.task.workUnits[this.workUnitIndex].workload / 1e6 && durationPointer < this.selectedDuration + 60000 * 30) {
			durationPointer += 60000 * 5
			this.times.push(durationPointer)
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
