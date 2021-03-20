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
}

export interface TaskUnwound extends Task {
	workUnit: WorkUnit
	workUnitsIndex: number
	workUnitsCount: number
}

export class TaskModified {
	constructor(
		name: string,
		description: string,
		priority: number,
		workloadOverall: number,
		dueAt: string,
		tags: string[] = []
	) {
		this.name = name
		this.description = description
		this.priority = priority
		this.workloadOverall = workloadOverall
		this.dueAt = new EventModified(dueAt)
		this.tags = tags
	}

	name = ''
	description = ''
	tags: string[] = []
	priority = 2
	workloadOverall = 0
	dueAt: EventModified
}

export class EventModified {
	date!: {
		start: string
	}

	constructor(date: string) {
		this.date.start = date
	}
}
