import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'

@Component({
	selector: 'app-slider',
	templateUrl: './slider.component.html',
	styleUrls: ['./slider.component.scss'],
})
export class SliderComponent {
	constructor(private elRef: ElementRef) {}

	index = 0
	@Input() showButtons = true
	@Input() listArray: any[] = []
	@Input() startsAtIndex = 0

	previousActive = false
	nextActive = false

	ngOnInit(): void {
	}
}
