import { trigger, transition, style, animate } from '@angular/animations'
import { Component, HostListener, Input, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
import { modalBackground, modalFlyInOut } from 'src/app/animations'
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
		modalBackground,
		modalFlyInOut
	],
})
export class ReschedulingModalComponent
	extends SimpleModalComponent<ReschedulingModalData, ModalResult<Timespan[]>>
	implements OnInit, ReschedulingModalData
{
	task!: Task
	workUnitIndex!: number
	timespanGroups: Timespan[][][] = []

	isOpen = false
	loading = false
	noOptionsAvailable: boolean = false
	noMoreOptions: boolean = false
	currentPage = 0

	result = new ModalResult<Timespan[]>([], false)

	DURATION_UNIT = DurationUnit

	constructor(private taskService: TaskService) {
		super()
	}

	@HostListener('document:keydown', ['$event'])
	handleEscape(event: KeyboardEvent): void {
		if (event.key === 'ArrowLeft') {
			this.prevPage()
			return
		}

		if (event.key === 'ArrowRight') {
			this.nextPage()
			return
		}
	}

	ngOnInit(): void {
		this.isOpen = true

		this.loading = true
		this.taskService.fetchReschedulingSuggestions(this.task, this.task.workUnits[this.workUnitIndex].id, []).subscribe(
			(timespanGroups) => {
				this.timespanGroups = [timespanGroups]
				if (timespanGroups.length === 0) {
					this.noOptionsAvailable = true
				}

				if (timespanGroups.length < 5) {
					this.noMoreOptions = true
				}

				this.loading = false
			},
			() => {
				this.loading = false
				this.close()
			}
		)
	}

	nextPage() {
		if (this.currentPage === this.timespanGroups.length - 1) {
			return
		}
		this.currentPage++
	}

	prevPage() {
		if (this.currentPage === 0) {
			return
		}
		this.currentPage--
	}

	lastPage() {
		this.currentPage = this.timespanGroups.length - 1
	}

	loadMore(): void {
		this.loading = true
		this.taskService.fetchReschedulingSuggestions(this.task, this.task.workUnits[this.workUnitIndex].id, this.timespanGroups.flat(3)).subscribe(
			(timespanGroups) => {
				this.timespanGroups.push(timespanGroups)
				if (timespanGroups.length < 5) {
					this.noMoreOptions = true
				}

				if (timespanGroups.length > 0) {
					this.nextPage()
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
