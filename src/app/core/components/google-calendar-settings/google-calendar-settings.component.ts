import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastType } from 'src/app/models/toast';
import { CalendarConnectionStatus, User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-google-calendar-settings',
	templateUrl: './google-calendar-settings.component.html'
})
export class GoogleCalendarSettingsComponent implements OnInit {

	constructor(private authService: AuthService, private toastService: ToastService) { }

	user?: User
	isCalendarsChanged = false
	lastCalendarsHash = "start"

	loading = false

	@Output() valid = new EventEmitter<boolean>()

	CONNECTION_STATUS = CalendarConnectionStatus

	googleCalendars: {calendarId: string, name: string, isActive: boolean}[] = []

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (!user) {
				return
			}

			this.valid.emit(user.googleCalendarConnection.status === CalendarConnectionStatus.Active)
			
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
			const w = window.open(response.url, "_blank");
			setTimeout(() => {
				if (w === null) {
					this.toastService.newToast(ToastType.Warning, "Your browser seems to have blocked the new tab. Please open it via this", true, 0, {title: 'link', link: response.url})
				}
			}, 50)
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
		this.loading = true
		this.authService.postCalendars({googleCalendar: this.googleCalendars}).subscribe(response => {
			this.lastCalendarsHash = this.calculateHash()
			this.calendarsChanged()
			this.loading = false
		}, () => {
			this.loading = false
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
