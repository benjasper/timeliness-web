import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core'

@Component({
	selector: 'app-slider',
	templateUrl: './slider.component.html',
	styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
	constructor(private elRef: ElementRef) {}

	index = 0
	@Input() showButtons = true
	@Input() listArray?: any[]

	previousActive = false
	nextActive = false

	ngOnInit(): void {
		if (!this.listArray) {
			throw Error('Slider needs the array in param listArray that builds the list')
		}
		this.checkButtonsActive()
	}

	public show(event: any, increase: number): void {
		const liEls: HTMLElement[] = this.elRef.nativeElement.querySelectorAll('li')
		this.index = (this.index + liEls.length + increase) % liEls.length

		this.checkButtonsActive()

		liEls[this.index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'start' })
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

		console.log(this.index)
		if (this.index === this.listArray.length - 1) {
			this.nextActive = false
		}
	}
}
