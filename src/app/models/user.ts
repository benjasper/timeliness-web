export interface User {
	id: string
	firstname: string
	lastname: string
	email: string
	createdAt: string
	lastModifiedAt: string
	googleCalendarConnection: {
		status: CalendarConnectionStatus
	}
}

export enum CalendarConnectionStatus {
	Inactive = '', Active = 'active', Expired = 'expired'
}
