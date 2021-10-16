import { Duration, DurationUnit } from './duration'

export {}
declare global {
	interface Number {
		toDuration: (unit?: DurationUnit) => Duration
	}

	interface Date {
		getWeekNumber: (includeYear?: boolean) => number
		addDays: (days: number) => Date
		isSameDay:(date: Date) => boolean
	}
}
