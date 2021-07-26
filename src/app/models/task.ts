import { Event } from './event'
import { WorkUnit } from './workunit'
export interface Task {
	id: string
	userId: string
	createdAt: string
	lastModifiedAt: string
	name: string
	description: string
	isDone: boolean
	tags: string[]
	priority: number
	workloadOverall: number
	dueAt: Event
	workUnits: WorkUnit[]
	deleted: boolean
}

export interface TaskUnwound extends Task {
	workUnit: WorkUnit
	workUnitsIndex: number
	workUnitsCount: number
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
