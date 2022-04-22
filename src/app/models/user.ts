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
		email: string
	}[],
	settings: UserSettings
	emailVerified: boolean
	billing: {
		endsAt: string
		status: BillingStatus
	}
}

export enum BillingStatus {
	Active = "subscriptionActive",
	Trial = "trial",
	Cancelled = "subscriptionCancelled",
	PaymentProblem = "paymentProblem",
}

export interface UserSettings {
	onboardingCompleted?: boolean
	scheduling?: {
		timeZone?: string
		allowedTimespans?: Timespan[]
		busyTimeSpacing?: number
		timingPreference?: TimingPreferences
		maxWorkUnitDuration?: number
		minWorkUnitDuration?: number
		hideDeadlineWhenDone?: boolean
	}
}

export enum TimingPreferences {
	Early = 'early', VeryEarly = 'veryEarly', Late = 'late', VeryLate = 'veryLate'
}

export enum CalendarConnectionStatus {
	Inactive = '', Active = 'active', Expired = 'expired', Unverified = 'unverified', MissingScopes = 'missing_scopes'
}
