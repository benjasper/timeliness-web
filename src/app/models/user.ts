import { Timespan } from "./timespan";
export interface User {
	id: string
	firstname: string
	lastname: string
	email: string
	createdAt: string
	lastModifiedAt: string
	googleCalendarConnection: {
		status: CalendarConnectionStatus
	},
	settings: UserSettings
}

export interface UserSettings {
	scheduling: {
		timeZone?: string
		allowedTimespans?: Timespan[]
	}
}

export enum CalendarConnectionStatus {
	Inactive = '', Active = 'active', Expired = 'expired'
}
