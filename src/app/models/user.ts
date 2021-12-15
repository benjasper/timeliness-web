import { Timespan } from "./timespan";
export interface User {
	id: string
	firstname: string
	lastname: string
	email: string
	createdAt: string
	lastModifiedAt: string
	googleCalendarConnections?: {
		status: CalendarConnectionStatus,
		id: string
	}[],
	settings: UserSettings
	emailVerified: boolean
}

export interface UserSettings {
	onboardingCompleted?: boolean
	scheduling?: {
		timeZone?: string
		allowedTimespans?: Timespan[]
		busyTimeSpacing?: number
	}
}

export enum CalendarConnectionStatus {
	Inactive = '', Active = 'active', Expired = 'expired', Unverified = 'unverified'
}
