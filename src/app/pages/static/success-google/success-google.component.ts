import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { PageComponent } from '../../page'

@Component({
	selector: 'app-success-google',
	templateUrl: './success-google.component.html',
})
export class SuccessGoogleComponent extends PageComponent implements OnInit {
	constructor(titleService: Title) {
		super(titleService)
	}

	ngOnInit(): void {
		this.setTitle('Google connected')
	}
}
