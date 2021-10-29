import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarConnectionStatus, User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: 'app-google-calendar-settings',
	templateUrl: './google-calendar-settings.component.html'
})
export class GoogleCalendarSettingsComponent implements OnInit {

	constructor(private authService: AuthService) { }

	user?: User

	CONNECTION_STATUS = CalendarConnectionStatus

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (!user) {
				return
			}

			this.user = user
		})
	}

	connect() {
		this.authService.connectGoogleCalendar().subscribe(response => {
			document.addEventListener('visibilitychange', this.handleVisibilityChange, false)
			window.open(response.url, "_blank");
		})
	}

	handleVisibilityChange = () => {
		if (document['hidden']) {
			document.title = 'Timeliness | Waiting for Google Calendar'
		} else {
			document.title = 'Timeliness'
			this.authService.forceUserUpdate()
			document.removeEventListener('visibilitychange', this.handleVisibilityChange)
		}

	}

}
