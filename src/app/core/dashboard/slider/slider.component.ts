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

	ngOnInit(): void {}

	public show(event: any, increase: number): void {
		const liEls: HTMLElement[] = this.elRef.nativeElement.querySelectorAll('li')
		this.index = (this.index + liEls.length + increase) % liEls.length
		liEls[this.index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'start' })
	}
}
