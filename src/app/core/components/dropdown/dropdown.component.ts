import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

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

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
	clickout(event: Event) {
		let clickedInside = this.elementRef.nativeElement.contains(event.target)

		if (!clickedInside) {
			this.isFocused = false
		} else {
			this.isFocused = true
		}
	}

  ngOnInit(): void {
  }

}
