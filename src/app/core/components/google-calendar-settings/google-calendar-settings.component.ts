import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast, ToastType } from 'src/app/models/toast';
import { CalendarConnectionStatus, User } from 'src/app/models/user';
import { AuthService, Calendar, Calendars } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-google-calendar-settings',
	templateUrl: './google-calendar-settings.component.html'
})
export class GoogleCalendarSettingsComponent implements OnInit {

	constructor(private authService: AuthService, private modalService: ModalService) { }

	user?: User

	loading = false

	@Input() allowMoreThanOneConnection = true
	@Output() valid = new EventEmitter<boolean>()

	CONNECTION_STATUS = CalendarConnectionStatus

	connections: {id: string, status: CalendarConnectionStatus, calendars: Calendars}[] = []

	calendars: Map<string, Calendars> = new Map()
	connectionLoading: Map<string, boolean> = new Map()

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (!user) {
				return
			}

			this.user = user
			this.calendars.clear()
			if (!user.googleCalendarConnections) {
				return
			}

			this.valid.emit(user.googleCalendarConnections.filter(x => x.status === CalendarConnectionStatus.Active).length > 0)
			
			user.googleCalendarConnections.filter(x => x.status === CalendarConnectionStatus.Active).forEach(connection => {
				this.calendars = this.calendars.set(connection.id, [])
			})

			user.googleCalendarConnections.forEach(connection => {
				this.connectionLoading.set(connection.id, false)
				if (connection.status !== CalendarConnectionStatus.Active) {
					return
				}

				this.connectionLoading.set(connection.id, true)
				this.authService.fetchCalendarsByConnection(connection.id).subscribe(response => {
					this.calendars = this.calendars.set(connection.id, response.calendars.sort((a,b) => {
						return a.name.localeCompare(b.name)
					}))
					this.connectionLoading.set(connection.id, false)
				}, () => {
					const index = user.googleCalendarConnections?.findIndex(x => x.id === connection.id)
					if (index !== undefined && this.user !== undefined && this.user.googleCalendarConnections) {
						this.user.googleCalendarConnections[index].status = CalendarConnectionStatus.Expired
					}
					this.connectionLoading.set(connection.id, false)
				})
			})
		})
	}

	connect(connectionId?: string) {
		const w = window.open("", "Timeliness | Google Calendar");
		this.authService.connectGoogleCalendar(connectionId).subscribe(response => {
			document.addEventListener('visibilitychange', this.handleVisibilityChange, false)
			if (w === null) {
				this.modalService.newToast(ToastType.Warning, "Your browser seems to have blocked the new window. Please open it via this", true, 20, {title: 'link', link: response.url})
				return
			}
			w.location = response.url
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

	saveChanges(connectionId: string, calendars: Calendars) {
		this.loading = true
		const observable = this.authService.updateCalendarsForConnection(connectionId, calendars)

		const toast = new Toast(ToastType.Success, `Calendars saved`)
		toast.loading = observable.toPromise()
		this.modalService.addToast(toast)
		
		observable.subscribe(() => {
			this.loading = false
		}, () => {
			this.loading = false
			this.authService.forceUserUpdate()
		})
	}

	disconnect(connectionId: string) {
		this.authService.deleteConnection(connectionId).subscribe(response => {
			this.modalService.newToast(ToastType.Success, `Connection deleted`)
			this.authService.forceUserUpdate()
		})
	}
}
