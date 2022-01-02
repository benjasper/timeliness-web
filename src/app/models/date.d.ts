export {}

declare global {
	interface Date {
		getWeekNumber: (includeYear?: boolean) => number
		addDays: (days: number) => Date
		isSameDay: (date: Date) => boolean
		getClock: () => number
		getCloseToTodayString: () => string|undefined
	}
}