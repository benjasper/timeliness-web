import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast, ToastType } from 'src/app/models/toast';
import { CalendarConnectionStatus, User } from 'src/app/models/user';
import { AuthService, Calendar, Calendars } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { Output, EventEmitter } from '@angular/core';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-google-calendar-settings',
	templateUrl: './google-calendar-settings.component.html'
})
export class GoogleCalendarSettingsComponent implements OnInit {

	constructor(private authService: AuthService, private modalService: ModalService) { }

	user?: User

	@Input() allowMoreThanOneConnection = true
	@Output() valid = new EventEmitter<boolean>()

	CONNECTION_STATUS = CalendarConnectionStatus

	connections: {id: string, status: CalendarConnectionStatus, calendars: Calendars}[] = []

	calendars: Map<string, Calendars> = new Map()
	connectionLoading: Map<string, boolean> = new Map()

	userSubscription!: Subscription

	ngOnDestroy() {
		this.userSubscription.unsubscribe()
	}

	ngOnInit(): void {
		this.userSubscription = this.authService.user.subscribe(user => {
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
		this.connectionLoading.set(connectionId, true)
		const observable = this.authService.updateCalendarsForConnection(connectionId, calendars)

		const toast = new Toast(ToastType.Success, `Calendars saved`)
		toast.loading = observable.toPromise()
		this.modalService.addToast(toast)
		
		observable.subscribe(() => {
			this.connectionLoading.set(connectionId, false)
		}, () => {
			this.connectionLoading.set(connectionId, false)
			this.authService.forceUserUpdate()
		})
	}

	disconnect(connectionId: string) {
		const connection = this.user?.googleCalendarConnections?.find(x => x.id === connectionId)
		if (!connection) {
			return
		}

		if (connection.status === CalendarConnectionStatus.Active) {
			this.modalService.addModal(ConfirmationModalComponent, {title: 'Revoke access to Google Calendar?', message: 'Are you sure you want to revoke access to this Google Calendar connection? Your will have to grant access again to revert this action.'}).subscribe(result => {
				if (result && result.result.result === true) {
					this.connectionLoading.set(connectionId, true)
	
					this.authService.revokeGoogleConnection(connectionId).subscribe(response => {
						this.modalService.newToast(ToastType.Success, `Connection revoked`)
					}, () => {
						this.connectionLoading.set(connectionId, true)
					})
				}
			})
		} else {
			this.modalService.addModal(ConfirmationModalComponent, {title: 'Remove Google Calendar connection?', message: 'Are you sure you want to disconnect this Google Calendar connection? Your Account will still be accessible with the Google Account you first logged in with.'}).subscribe(result => {
				if (result && result.result.result === true) {
					this.connectionLoading.set(connectionId, true)
	
					this.authService.deleteConnection(connectionId).subscribe(response => {
						this.modalService.newToast(ToastType.Success, `Connection deleted`)
						this.authService.forceUserUpdate()
					}, () => {
						this.connectionLoading.set(connectionId, true)
					})
				}
			})
		}
	}
}
