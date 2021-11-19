import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { Duration, DurationUnit } from './app/models/duration'
import { environment } from './environments/environment'

if (environment.production) {
	enableProdMode()
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err))

// tslint:disable-next-line: only-arrow-functions
Number.prototype.toDuration = function (unit: DurationUnit = DurationUnit.Milliseconds): Duration {
	if (unit === DurationUnit.Nanoseconds) {
		return new Duration(this.valueOf() / 1000000)
	}
	return new Duration(this.valueOf())
}

Date.prototype.getWeekNumber = function (includeYear: boolean = false): number {
	const d: any = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart: any = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))

	const weeknumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)

	if (includeYear) {
		return weeknumber + this.getFullYear()
	}
	return weeknumber
}

Date.prototype.addDays = function (days: number): Date {
	const date = new Date(this.valueOf())
	date.setDate(date.getDate() + days)
	return date
}

Date.prototype.isSameDay = function (date: Date): boolean {
	const hash1 = this.getFullYear().toString() + this.getMonth().toString() + this.getDate().toString()
	const hash2 = date.getFullYear().toString() + date.getMonth().toString() + date.getDate().toString()

	return hash1 === hash2
}

Date.prototype.getClock = function (): number {
	return this.getHours() * 60 * 60 + this.getMinutes() * 60 + this.getSeconds()
}

// tslint:disable-next-line: only-arrow-functions
String.prototype.toDate = function (): Date {
	return new Date(this.valueOf())
}
