import {
	Component,
	ElementRef,
	HostListener,
	ModuleWithComponentFactories,
	OnChanges,
	OnInit,
	SimpleChanges,
	ViewChild,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { forwardRef, HostBinding, Input } from '@angular/core'
import { trigger, transition, style, animate } from '@angular/animations'
import { flyInOutWithTransform } from 'src/app/animations'

@Component({
	selector: 'app-datetime-picker',
	templateUrl: './datetime-picker.component.html',
	styleUrls: ['./datetime-picker.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DatetimePickerComponent),
			multi: true,
		},
	],
	animations: [
		flyInOutWithTransform('translateX(-50%)', 50)
	],
})
export class DatetimePickerComponent implements OnInit, ControlValueAccessor {
	constructor(private elementRef: ElementRef) {}

	public selected: Date = new Date()
	public today: Date = new Date()

	public month!: number
	public year!: number

	isFocused = false

	emptyDays: number[] = []
	monthDates: Date[] = []

	times: Date[] = []

	weekdays: Date[] = []

	@Input() weekStartsAtMonday = true
	@Input() disabled = false
	@ViewChild('calendar') calendar!: ElementRef

	@HostListener('document:click', ['$event'])
	clickout(event?: Event) {
		let clickedInside = event ? this.elementRef.nativeElement.contains(event?.target) : false

		if (!clickedInside) {
			this.isFocused = false
		}
	}

	@HostListener('wheel', ['$event']) onMousewheel(event: WheelEvent): void {
		let clickedInside = this.calendar.nativeElement.contains(event.target)
		if (!clickedInside) {
			return
		}

		if (event.deltaY < 0) {
			this.previousMonth(event)
		}

		if (event.deltaY > 0) {
			this.nextMonth(event)
		}
	}

	ngOnInit(): void {
		this.goToMonth(this.selected.getMonth(), this.selected.getFullYear())

		this.updateCalendarView()

		this.selected.setMilliseconds(0)

		this.generateTimeOptions()

		// Generate weekday lookup
		let start = this.weekStartsAtMonday ? 5 : 4

		for (let day = start; day < start + 7; day++) {
			this.weekdays.push(new Date(Date.UTC(1970, 0, day)))
		}
	}

	private generateTimeOptions() {
		this.times = []
		for (let i = 0; i < 24; i++) {
			for (let minutes = 0; minutes <= 45; minutes += 15) {
				const time = new Date(this.selected)
				time.setMinutes(minutes, 0, 0)
				time.setHours(i)
				time.setMilliseconds(0)

				if (time.getTime() < new Date().getTime() + 1000 * 60 * 15) {
					continue
				}

				this.times.push(time)
			}
		}

		if (this.selected && !this.times.includes(this.selected)) {
			this.times.push(this.selected)
			this.times.sort((a, b) => a.getTime() - b.getTime())
		}
	}

	private updateCalendarView() {
		this.setDatesByMonth()
		this.setWeekDaysBefore()
	}

	onChange = (date: Date) => {}

	onTouched = () => {}

	writeValue(obj: any): void {
		if (!obj) {
			return
		}

		this.selected = obj

		this.generateTimeOptions()
		this.updateCalendarView()
	}

	registerOnChange(fn: any): void {
		this.onChange = fn
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled
	}

	onTimeChange(time: number) {
		const date = new Date(time)
		this.selected.setMinutes(date.getMinutes())
		this.selected.setHours(date.getHours())
		this.selected.setSeconds(date.getSeconds())
		this.selected.setMilliseconds(0)

		this.onChange(this.selected)
	}

	toggleDropdown() {
		if (!this.isFocused) {
			this.goToMonth(this.selected.getMonth(), this.selected.getFullYear())
		}

		this.isFocused = !this.isFocused
	}

	public getDateByMonthAndYear(month: number, year: number) {
		const date = new Date()

		date.setMonth(month, 1)
		date.setFullYear(year)
		return date
	}

	nextMonth(event: Event) {
		event.preventDefault()
		let newMonth = this.month

		if (newMonth === 11) {
			newMonth = 1
			this.year++
		} else {
			newMonth++
		}

		this.month = newMonth

		this.updateCalendarView()
	}

	previousMonth(event: Event) {
		event.preventDefault()
		let newMonth = this.month

		if (newMonth === 0) {
			newMonth = 11
			this.year--
		} else {
			newMonth--
		}

		this.month = newMonth

		this.updateCalendarView()
	}

	goToMonth(month: number, year: number) {
		this.month = month
		this.year = year

		this.updateCalendarView()
	}

	selectDate(event: Event, date: Date = new Date()) {
		event.preventDefault()
		event.stopPropagation()

		this.year = date.getFullYear()
		this.month = date.getMonth()

		date.setHours(this.selected.getHours())
		date.setMinutes(this.selected.getMinutes())
		date.setSeconds(this.selected.getSeconds())
		date.setMilliseconds(0)

		this.selected = date
		this.onChange(this.selected)

		this.generateTimeOptions()

		this.updateCalendarView()
	}

	setDatesByMonth() {
		let date = new Date()
		date.setDate(1)
		date.setFullYear(this.year)
		date.setMonth(this.month)

		const dates: Date[] = []

		while (date.getMonth() === this.month) {
			dates.push(date)
			date = date.addDays(1)
		}

		this.monthDates = dates
	}

	setWeekDaysBefore() {
		const date = new Date()
		date.setDate(1)
		date.setFullYear(this.year)
		date.setMonth(this.month)

		let weekdays = date.getDay()

		let start = 0

		if (this.weekStartsAtMonday) {
			start = 1

			if (weekdays === 0) {
				weekdays = 7
			}
		}

		const weekdayArray = []
		for (let i = start; i < weekdays; i++) {
			weekdayArray.push(i)
		}

		this.emptyDays = weekdayArray
	}
}
