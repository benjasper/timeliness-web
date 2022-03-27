import { trigger, transition, style, animate, state } from '@angular/animations'
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core'
import { flyInOut, flyInOutWithTransform } from 'src/app/animations'

@Component({
	selector: 'app-dropdown',
	templateUrl: './dropdown.component.html',
	styleUrls: ['./dropdown.component.scss'],
	animations: [
		flyInOutWithTransform('translateX(-50%)', 50)
	],
})
export class DropdownComponent implements OnInit {
	isFocused = false

	@Input() colorClasses = 'text-primary'
	@ViewChild('dropdown', { static: false }) dropdownElement!: ElementRef

	constructor(private elementRef: ElementRef) {}

	@HostListener('document:click', ['$event'])
	clickout(event: Event) {
		let clickedInside = this.elementRef.nativeElement.contains(event.target)

		if (!clickedInside) {
			this.isFocused = false
		} else {
			if (this.isFocused && this.dropdownElement.nativeElement.contains(event.target)) {
				this.isFocused = false
				return
			}
			this.isFocused = true
		}
	}

	ngOnInit(): void {}
}
