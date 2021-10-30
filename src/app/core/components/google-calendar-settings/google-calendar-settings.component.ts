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
	isCalendarsChanged = false
	lastCalendarsHash = "start"

	CONNECTION_STATUS = CalendarConnectionStatus

	googleCalendars: {calendarId: string, name: string, isActive: boolean}[] = []

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (!user) {
				return
			}

			this.user = user

			if (user.googleCalendarConnection.status === CalendarConnectionStatus.Active) {
				this.authService.fetchCalendars().subscribe(response => {
					this.googleCalendars = response.googleCalendar.sort((a,b) => {
						return a.name.localeCompare(b.name)
					})
					this.lastCalendarsHash = this.calculateHash()
					this.calendarsChanged()
				})
			}
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

	calendarsChanged() {
		this.isCalendarsChanged = !(this.calculateHash() === this.lastCalendarsHash)
	}

	saveChanges() {
		this.authService.postCalendars({googleCalendar: this.googleCalendars}).subscribe(response => {
			this.googleCalendars = response.googleCalendar.sort((a,b) => {
				return a.name.localeCompare(b.name)
			})
			this.lastCalendarsHash = this.calculateHash()
			this.calendarsChanged()
		})
	}

	calculateHash(): string {
		const actives = this.googleCalendars.filter(x => x.isActive)
		let hash = ""
		actives.forEach(x => {
			hash += x.calendarId
		})

		return hash
	}
}
