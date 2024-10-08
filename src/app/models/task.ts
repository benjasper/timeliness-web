import { AgendaEvent, Event } from './event'
import { WorkUnit } from './workunit'
export type Task = {
	id: string
	userId: string
	createdAt: string
	lastModifiedAt: string
	name: string
	description: string
	isDone: boolean
	tags: string[]
	workloadOverall: number
	notScheduled: number
	dueAt: Event
	workUnits: WorkUnit[]
	deleted: boolean
}

export type TaskUnwound = Task & {
	workUnit: WorkUnit
	workUnitsIndex: number
	workUnitsCount: number
}

export type TaskAgenda = Task & {
	date: AgendaEvent
	workUnitIndex: number
}

export enum CalendarType {
	GoogleCalendar = "google_calendar",
}
export interface PersistedEvent {
	calendarEventId: string
	calendarType: CalendarType
	userId: string
}

export class TaskModified {
	name?: string
	description?: string
	tags?: string[]
	priority?: string
	workloadOverall?: number
	dueAt?: EventModified
}

export class EventModified {
	date: {
		start: string
	} = {
		start: '',
	}

	constructor(date: string) {
		this.date.start = date
	}
}
