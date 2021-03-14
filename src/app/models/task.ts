import { Event } from './event'
import { WorkUnit } from './workunit';
export interface Task {
    id: string
    userId: string
    createdAt: Date
    lastModifiedAt: Date
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
