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
Number.prototype.toDuration = function(unit: DurationUnit = DurationUnit.Milliseconds): Duration {
	if (unit === DurationUnit.Nanoseconds) {
		return new Duration(this.valueOf() / 1000000)
	}
	return new Duration(this.valueOf())
}

// tslint:disable-next-line: only-arrow-functions
String.prototype.toDate = function(): Date {
	return new Date(this.valueOf())
}
