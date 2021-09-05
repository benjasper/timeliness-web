import { Component, ElementRef, HostListener, ModuleWithComponentFactories, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef, HostBinding, Input } from '@angular/core';

@Component({
    selector: 'app-datetime-picker',
    templateUrl: './datetime-picker.component.html',
    styleUrls: ['./datetime-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatetimePickerComponent),
            multi: true
        }
    ]
})
export class DatetimePickerComponent implements OnInit, ControlValueAccessor {

    constructor(private elementRef: ElementRef) { }

    public selected: Date = new Date()
    public today: Date = new Date()

    public month!: number
    public year!: number

    public weekStartsAtMonday = true
    isFocused = false

    emptyDays: number[] = []
    monthDates: Date[] = []

    times: Date[] = []

    @Input() disabled = false;
    @ViewChild('calendar') calendar!: ElementRef; 

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        event.stopPropagation()
        event.preventDefault()

        let clickedInside = this.elementRef.nativeElement.contains(event.target)
        const target = event.target as HTMLElement

        if (target.classList.contains('ng-option-label') || target.classList.contains('ng-option')) {
            clickedInside = true
        }

        if (!clickedInside) {
            this.isFocused = false
        } else {
            this.isFocused = true
        }
    }

    @HostListener('wheel', ['$event']) onMousewheel(event: WheelEvent): void {
        let clickedInside = this.calendar.nativeElement.contains(event.target)
        if (!clickedInside) {
            return
        }

		if (event.deltaY < 0) {
			this.previousMonth()
		}

		if (event.deltaY > 0) {
			this.nextMonth()
		}
	}

    ngOnInit(): void {
        this.goToMonth(this.selected.getMonth(), this.selected.getFullYear())

        this.updateCalendarView()

        const coeff = 1000 * 60 * 15;
        const date = this.selected
        date.setMilliseconds(0)
        this.selected = new Date(Math.ceil(date.getTime() / coeff) * coeff)

        this.generateTimeOptions()
    }

    private generateTimeOptions() {
        this.times = []
        for (let i = 0; i < 24; i++) {
            for (let minutes = 0; minutes <= 45; minutes += 15) {
                const time = new Date(this.selected)
                time.setMinutes(minutes, 0, 0)
                time.setHours(i)
                time.setMilliseconds(0)
                this.times.push(time)
            }
        }
    }

    private updateCalendarView() {
        this.setDatesByMonth()
        this.setWeekDaysBefore()
    }

    onChange = (date: Date) => { };

    onTouched = () => { };

    writeValue(obj: any): void {
        this.selected = obj

        this.generateTimeOptions()
        this.updateCalendarView()

        this.onChange(this.selected)
    }

    registerOnChange(fn: any): void {
        this.onChange = fn
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
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

        date.setMonth(month)
        date.setFullYear(year)
        return date
    }

    nextMonth() {
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

    previousMonth() {
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
        date.setFullYear(this.year)
        date.setMonth(this.month)
        date.setDate(1)

        const dates: Date[] = []

        while (date.getMonth() === this.month) {
            dates.push(date)
            date = date.addDays(1)
        }

        this.monthDates = dates
    }

    setWeekDaysBefore() {
        const date = new Date()
        date.setFullYear(this.year)
        date.setMonth(this.month)
        date.setDate(1)

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
