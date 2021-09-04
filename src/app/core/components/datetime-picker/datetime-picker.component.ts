import { Component, ElementRef, HostListener, ModuleWithComponentFactories, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'app-datetime-picker',
    templateUrl: './datetime-picker.component.html',
    styleUrls: ['./datetime-picker.component.scss']
})
export class DatetimePickerComponent implements OnInit, ControlValueAccessor {

    constructor(private elementRef: ElementRef) { }

    public selected: Date = new Date()

    public month!: number
    public year!: number

    public weekStartsAtMonday = true
    isFocused = false

    emptyDays: number[] = []
    monthDates: Date[] = []

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        const clickedInside = this.elementRef.nativeElement.contains(event.target)
        if (!clickedInside) {
            this.isFocused = false
        } else {
            this.isFocused = true
        }
    }

    ngOnInit(): void {
        this.month = this.selected.getMonth()
        this.year = this.selected.getFullYear()

        this.updateCalendarView()
    }

    updateCalendarView() {
        this.setDatesByMonth()
        this.setWeekDaysBefore()
    }

    writeValue(obj: any): void {
        throw new Error('Method not implemented.');
    }

    registerOnChange(fn: any): void {
        throw new Error('Method not implemented.');
    }

    registerOnTouched(fn: any): void {
        throw new Error('Method not implemented.');
    }

    toggleDropdown() {
        this.isFocused = !this.isFocused
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

    selectDate(event: Event, date: Date = new Date()) {
        event.preventDefault()
        event.stopPropagation()

        this.year = date.getFullYear()
        this.month = date.getMonth()
        this.selected = date

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

        const weekdays = date.getDay()

        const start = this.weekStartsAtMonday ? 1 : 0

        const weekdayArray = []
        for (let i = start; i < weekdays; i++) {
            weekdayArray.push(i)
        }

        this.emptyDays = weekdayArray
    }
}
