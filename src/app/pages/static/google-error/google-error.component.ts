import { Component, OnInit } from '@angular/core'

@Component({
	selector: 'app-google-error',
	templateUrl: './google-error.component.html',
})
export class GoogleErrorComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}

	close() {
		window.close()
	}
}
