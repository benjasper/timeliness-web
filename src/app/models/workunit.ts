import { Event } from './event'

export interface WorkUnit {
    id: string
    isDone: boolean
    markedDoneAt: Date
    scheduledAt: Event
    workload: number
}
