import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  animations: [
		trigger('fade', [
			transition(':enter', [style({ opacity: 0 }), animate(50)]),
			transition(':leave', [animate(50, style({ opacity: 0 }))]),
		]),
	],
})
export class DropdownComponent implements OnInit {

  isFocused = false

  @Input() colorClasses = "text-primary"
  @ViewChild('dropdown', { static: false }) dropdownElement!: ElementRef

  constructor(private elementRef: ElementRef) { }

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

  ngOnInit(): void {
  }

}
