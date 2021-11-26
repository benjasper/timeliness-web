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
	emailVerified: boolean
}

export interface UserSettings {
	onboardingCompleted?: boolean
	scheduling?: {
		timeZone?: string
		allowedTimespans?: Timespan[]
	}
}

export enum CalendarConnectionStatus {
	Inactive = '', Active = 'active', Expired = 'expired'
}
