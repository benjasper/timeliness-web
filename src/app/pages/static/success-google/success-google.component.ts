import { AfterViewInit, Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { PageComponent } from '../../page'

@Component({
	selector: 'app-success-google',
	templateUrl: './success-google.component.html',
})
export class SuccessGoogleComponent extends PageComponent implements OnInit, AfterViewInit {
	constructor(titleService: Title) {
		super(titleService)
	}
	ngAfterViewInit(): void {
		window.close()
	}

	ngOnInit(): void {
		this.setTitle('Google connected')
	}
}
