import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core'

@Component({
	selector: 'app-slider',
	templateUrl: './slider.component.html',
	styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit, AfterViewInit {
	constructor(private elRef: ElementRef) {}

	index = 0
	@Input() showButtons = true
	@Input() listArray: any[] = []
	@Input() startsAtIndex = 0

	previousActive = false
	nextActive = false

	ngOnInit(): void {
		if (!this.listArray) {
			throw Error('Slider needs the array in param listArray that builds the list')
		}
		
		this.index = this.startsAtIndex
		this.checkButtonsActive()
	}

	ngAfterViewInit(): void {
		this.show(undefined, 0, true)
	}

	@HostListener('wheel', ['$event']) onMousewheel(event: WheelEvent): void {
		if (!this.listArray) {
			throw Error('Slider needs the array in param listArray that builds the list')
		}

		if (this.listArray?.length <= 1) {
			return
		}

		if (event.deltaY < 0) {
			this.show(event, -1)
		}

		if (event.deltaY > 0) {
			this.show(event, 1)
		}
	}

	public show(event: any, increase: number, direct = false): void {
		if (this.listArray?.length <= 1) {
			return
		}

		const liEls: HTMLElement[] = this.elRef.nativeElement.querySelectorAll('li')
		this.index = (this.index + liEls.length + increase) % liEls.length

		this.checkButtonsActive()

		let behaviour: ScrollBehavior = 'smooth'

		if (direct) {
			behaviour = 'auto'
		}

		liEls[this.index].scrollIntoView({ behavior: behaviour, inline: 'start', block: 'start' })
	}

	private checkButtonsActive(): void {
		if (!this.listArray) {
			throw Error('Slider needs the array in param listArray that builds the list')
		}

		this.previousActive = true
		this.nextActive = true

		if (this.index === 0) {
			this.previousActive = false
		}

		if (this.index === this.listArray.length - 1) {
			this.nextActive = false
		}
	}
}
