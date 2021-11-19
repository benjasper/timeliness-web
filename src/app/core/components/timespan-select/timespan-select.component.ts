import { Component, OnInit } from '@angular/core'
import { start } from 'repl'
import { Timespan, TimespanWithDate } from 'src/app/models/timespan'
import { ToastType } from 'src/app/models/toast'
import { User } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { ToastService } from 'src/app/services/toast.service'

@Component({
	selector: 'app-timespan-select',
	templateUrl: './timespan-select.component.html',
})
export class TimespanSelectComponent implements OnInit {
	constructor(private authService: AuthService, private toastService: ToastService) {}

	timespans: TimespanWithDate[] = []
	user?: User
	wasEdited = false

	ngOnInit(): void {
		this.authService.user.subscribe((user) => {
			if (!user) {
				return
			}

			this.timespans = this.toDateTimespan(user.settings.scheduling.allowedTimespans ?? [])
			this.user = user
		})
	}

	addEntry() {
		const start = new Date(0)
		start.setHours(9)

		const end = new Date(0)
		end.setHours(17)

		this.timespans.push({
			start: start,
			end: end,
		})

		this.timespanChanged()
	}

	removeEntry(index: number) {
		this.timespans.splice(index, 1)
		this.timespanChanged()
	}

	timespanChanged() {
		if (
			(this.user &&
				JSON.stringify(this.user.settings.scheduling.allowedTimespans) ===
					JSON.stringify(this.toStringTimespan(this.timespans))) ||
			(this.user?.settings.scheduling.allowedTimespans === undefined && this.timespans.length === 0)
		) {
			this.wasEdited = false
		} else {
			this.wasEdited = true
		}
	}

	toStringTimespan(timespans: TimespanWithDate[]): Timespan[] {
		return timespans.map((value) => {
			const start = new Date(value.start)
			const end = new Date(value.end)

			if (end.getClock() < start.getClock()) {
				end.setDate(2)
			} else {
				end.setDate(1)
			}

			return { start: start.toISOString(), end: end.toISOString() }
		})
	}

	toDateTimespan(timespans: Timespan[]): TimespanWithDate[] {
		return timespans.map((value) => {
			return { start: value.start.toDate(), end: value.end.toDate() }
		})
	}

	save() {
		this.authService
			.patchUserSettings({ scheduling: { allowedTimespans: this.toStringTimespan(this.timespans) } })
			.subscribe(
				() => {
					this.wasEdited = false
					this.toastService.newToast(ToastType.Success, 'Saved scheduling times')
				},
				() => {
					this.timespans = this.toDateTimespan(this.user?.settings.scheduling.allowedTimespans ?? [])
					this.wasEdited = false
				}
			)
	}
}
