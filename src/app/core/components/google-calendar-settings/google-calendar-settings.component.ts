import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastType } from 'src/app/models/toast';
import { CalendarConnectionStatus, User } from 'src/app/models/user';
import { AuthService, Calendar, Calendars } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-google-calendar-settings',
	templateUrl: './google-calendar-settings.component.html'
})
export class GoogleCalendarSettingsComponent implements OnInit {

	constructor(private authService: AuthService, private toastService: ToastService) { }

	user?: User

	loading = false

	@Output() valid = new EventEmitter<boolean>()

	CONNECTION_STATUS = CalendarConnectionStatus

	connections: {id: string, status: CalendarConnectionStatus, calendars: Calendars}[] = []

	calendars: Map<string, Calendars> = new Map()

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (!user) {
				return
			}

			this.valid.emit(user.googleCalendarConnections.filter(x => x.status === CalendarConnectionStatus.Active).length > 0)
			
			this.calendars.clear()
			user.googleCalendarConnections.filter(x => x.status === CalendarConnectionStatus.Active).forEach(connection => {
				this.calendars = this.calendars.set(connection.id, [])
			})

			this.user = user

			user.googleCalendarConnections.forEach(connection => {
				if (connection.status !== CalendarConnectionStatus.Active) {
					return
				}

				this.authService.fetchCalendarsByConnection(connection.id).subscribe(response => {
					this.calendars = this.calendars.set(connection.id, response.calendars.sort((a,b) => {
						return a.name.localeCompare(b.name)
					}))
				})
			})
		})
	}

	connect(connectionId?: string) {
		this.authService.connectGoogleCalendar(connectionId).subscribe(response => {
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

	saveChanges(connectionId: string, calendar: Calendar) {
		this.loading = true
		this.authService.updateCalendarsForConnection(connectionId, calendar).subscribe(response => {
			this.loading = false
			this.toastService.newToast(ToastType.Success, `Calendar ${calendar.name} updated`)
		}, () => {
			this.loading = false
		})
	}

	disconnect(connectionId: string) {
		this.authService.deleteConnection(connectionId).subscribe(response => {
			this.toastService.newToast(ToastType.Success, `Connection deleted`)
			this.authService.forceUserUpdate()
		})
	}
}
