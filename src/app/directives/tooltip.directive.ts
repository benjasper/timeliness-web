import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core'

@Directive({
	selector: '[tooltip]',
})
export class TooltipDirective {
	@Input() tooltip = ''
	@Input() position: 'left' | 'right' | 'top' | 'bottom' = 'right'
	@Input() delay: number = 0

	private popup?: HTMLElement
	private timer?: NodeJS.Timeout

	constructor(private el: ElementRef, private renderer: Renderer2) {}

	ngOnDestroy(): void {
		this.removePopup()
	}

	@HostListener('mouseenter') onMouseEnter() {
		if (this.delay !== 0) {
			this.timer = setTimeout(() => this.createTooltipPopup(), this.delay * 1000)
			return
		}
		this.createTooltipPopup()
	}

	@HostListener('mouseleave') onMouseLeave() {
		this.removePopup()
	}

	private removePopup() {
		if (this.timer) {
			clearTimeout(this.timer)
			this.timer = undefined
		}

		if (this.popup) {
			this.renderer.removeChild(document.body, this.popup)
			this.popup = undefined
		}
	}

	private createTooltipPopup() {
		let x = this.el.nativeElement.getBoundingClientRect().left + this.el.nativeElement.offsetWidth / 2
		let y = this.el.nativeElement.getBoundingClientRect().top + this.el.nativeElement.offsetHeight / 2

		const popup = document.createElement('div')
		popup.innerHTML = this.tooltip
		popup.setAttribute('class', 'tooltip')

		this.popup = popup

		this.renderer.appendChild(document.body, this.popup)
		
		switch (this.position) {
			case 'right':
				y -= popup.offsetHeight / 2
				x += (this.el.nativeElement.getBoundingClientRect().width / 2) + 10
				break
			case 'left':
				y -= popup.offsetHeight / 2
				x -= this.el.nativeElement.getBoundingClientRect().width / 2 + popup.offsetWidth + 10
				break
			case 'top':
				x -= popup.offsetWidth / 2
				y -= this.el.nativeElement.getBoundingClientRect().height / 2 + popup.offsetHeight + 10
				break
			case 'bottom':
				x -= popup.offsetWidth / 2
				y += this.el.nativeElement.getBoundingClientRect().height / 2 + 10
				break
		}

		popup.setAttribute('style', `position: absolute; top: ${y}px; left: ${x}px;`)
	}
}
