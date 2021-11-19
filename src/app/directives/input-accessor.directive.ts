import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core'

@Directive({
	selector: '[contenteditable]',
})
export class InputAccessorDirective {
	private currentValue: string | null = null

	constructor(private elRef: ElementRef, private renderer: Renderer2) {}

	@Input() set value(value: string) {
		if (value !== this.currentValue) {
			this.renderer.setProperty(this.elRef.nativeElement, 'textContent', value)
		}
	}

	@HostListener('input', ['$event'])
	onInput(event: any) {
		this.currentValue = event.target.innerText
	}
}
