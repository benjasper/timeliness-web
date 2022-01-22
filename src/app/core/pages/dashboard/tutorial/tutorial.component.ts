import { trigger, transition, style, animate } from '@angular/animations'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { PageComponent } from 'src/app/pages/page'

@Component({
	selector: 'app-tutorial',
	templateUrl: './tutorial.component.html',
	animations: [
		trigger('flyInOut', [
			transition(':enter', [style({ opacity: 0 }), animate(200)]),
			transition(':leave', [animate(200, style({ transform: 'translate(-50%, 150%)', opacity: 0 }))]),
		]),
	],
})
export class TutorialComponent extends PageComponent implements OnInit, OnDestroy {
	constructor(private router: Router, protected titleService: Title) {
		super(titleService)
	}

	isShowing = true
	numberOfSlides = 0
	slideIndex: number = 0

	slideOnTheMove = false

	ngOnInit(): void {
		this.setTitle('Getting started')
	}

	close() {
		this.isShowing = false
		setTimeout(() => {
			this.router.navigate(['/dashboard'])
		}, 200)
	}

	next() {
		this.slideIndex = this.slideIndex + 1
		if (this.slideIndex === this.numberOfSlides) {
			this.close()
		}
	}

	private move() {
		this.slideOnTheMove = true
	}

	private moved() {
		this.slideOnTheMove = false
	}

	previous() {
		if (this.slideIndex === 0) {
			return
		}
		this.slideIndex = this.slideIndex - 1
	}

	onSplideInit(splide: any) {
		splide.on('mounted', this.onMounted(splide))

		splide.on('move', this.onMove)

		splide.on('moved', this.onMoved)
	}

	onMounted(splide: any) {
		return () => {
			splide.refresh()
			this.numberOfSlides = splide.length
		}
	}

	onMove = () => {
		this.move()
	}

	onMoved = () => {
		this.moved()
	}

	ngOnDestroy(): void {
		window.removeEventListener('move', this.onMove)
		window.removeEventListener('moved', this.onMoved)
		window.removeEventListener('mounted', this.onMounted)
	}
}
