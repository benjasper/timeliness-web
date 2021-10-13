import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
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
