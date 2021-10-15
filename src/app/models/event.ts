export interface Event {
	date: {
		start: string
		end: string
	}
}

export interface AgendaEvent {
	date: {
		start: string
		end: string
	}
	type: AgendaEventType
}

export enum AgendaEventType {
	WorkUnit = 'WORK_UNIT', DueAt = 'DUE_AT'
}
