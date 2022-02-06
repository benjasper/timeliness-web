import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { fader, sliderRoutes } from './animations'
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	animations: [
		fader
	]
})
export class AppComponent implements OnInit {
	title = 'Timeliness'

	constructor() {}

	prepareRoute(outlet: RouterOutlet) {
		return outlet?.activatedRouteData?.['animation']
	}

	ngOnInit() {}
}
