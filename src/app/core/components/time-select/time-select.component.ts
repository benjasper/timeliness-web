import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
	selector: 'app-time-select',
	templateUrl: './time-select.component.html',
})
export class TimeSelectComponent implements OnInit {
	constructor() {}

	times: Date[] = []
	disabled = false
	@Input() selected!: Date
	@Output() selectedChange = new EventEmitter<Date>();

	ngOnInit(): void {
		this.generateTimeOptions()
	}

	private generateTimeOptions() {
		this.times = []
		let times: Date[] = []

		for (let i = 0; i < 24; i++) {
			for (let minutes = 0; minutes <= 45; minutes += 15) {
				const time = this.selected ? new Date(this.selected) : new Date(0)
				time.setMinutes(minutes, 0, 0)
				time.setHours(i)
				time.setMilliseconds(0)
				times.push(time)
			}
		}

		this.times = times
	}

	onTimeChange(time: number) {
		const date = new Date(time)
		this.selected.setMinutes(date.getMinutes())
		this.selected.setHours(date.getHours())
		this.selected.setSeconds(date.getSeconds())
		this.selected.setMilliseconds(0)

		this.selectedChange.emit(this.selected)
	}
}
