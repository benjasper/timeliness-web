import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ControlValueAccessor } from '@angular/forms'

@Component({
	selector: 'app-toggle',
	templateUrl: './toggle.component.html',
})
export class ToggleComponent implements OnInit, ControlValueAccessor {
	constructor() {}

	@Input() isToggled = false
	@Output() value = new EventEmitter<boolean>()

	ngOnInit(): void {}

	writeValue(val: boolean): void {
		this.isToggled = val
	}

	onInput(event: boolean) {
		this.value.emit(event)
	}

	onChange(val: boolean): void {}
	onTouched(val: boolean): void {}

	registerOnChange(fn: any): void {
		this.onChange = fn
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn
	}
}
