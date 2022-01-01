import { trigger, transition, style, animate } from '@angular/animations'
import { Component, Input, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
import { Task } from 'src/app/models/task'
import { Timespan } from 'src/app/models/timespan'
import { TaskService } from 'src/app/services/task.service'

export interface ReschedulingModalData {
	task: Task, workUnitIndex: number
}

@Component({
	selector: 'app-rescheduling-modal',
	templateUrl: './rescheduling-modal.component.html',
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
export class ReschedulingModalComponent extends SimpleModalComponent<ReschedulingModalData, Timespan[]|undefined> implements OnInit, ReschedulingModalData {
	task!: Task
	workUnitIndex!: number
	timespanGroups: Timespan[][] = []

	isOpen = false
	loading = false
	noOptionsAvailable: boolean = false

	constructor(private taskService: TaskService) {
		super()
	}

	ngOnInit(): void {
		this.isOpen = true

		this.loading = true
		this.taskService.fetchReschedulingSuggestions(this.task, this.workUnitIndex).subscribe((timespanGroups) => {
			this.timespanGroups = timespanGroups
			if (timespanGroups.length === 0) {
				this.noOptionsAvailable = true
			}
			this.loading = false
		})
	}

	close(): Promise<any> {
		this.isOpen = false
		return super.close()
	}

	apply(timespans: Timespan[]): void {
		this.result = timespans
		this.close()
	}
}
