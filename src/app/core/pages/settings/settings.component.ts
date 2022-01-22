import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser';
import { PageComponent } from 'src/app/pages/page';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
})
export class SettingsComponent extends PageComponent implements OnInit {
	constructor(protected titleService: Title) {
		super(titleService);
	}

	ngOnInit(): void {
		this.setTitle('Settings');
	}
}
