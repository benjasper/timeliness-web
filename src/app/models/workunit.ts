import { Event } from './event'

export interface WorkUnit {
    id: string
    isDone: boolean
    markedDoneAt: Event
    scheduledAt: Date
    workload: number
}
