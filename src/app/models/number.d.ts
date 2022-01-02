import { Duration, DurationUnit } from './duration'

export {}
declare global {
	interface Number {
		toDuration: (unit?: DurationUnit) => Duration
	}
}
