import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs'
import { catchError, retry, share, shareReplay, tap, windowTime } from 'rxjs/operators'
import { Duration, DurationUnit } from '../models/duration'
import { Pagination } from '../models/paginations'
import { Task, TaskAgenda, TaskModified, TaskUnwound } from '../models/task'
import { environment } from '../../environments/environment'
import { WorkUnit } from '../models/workunit'
import { element } from 'protractor'
import { Tag, TagModified } from '../models/tag'
import { ApiError } from '../models/error'
import { ModalService } from './modal.service'
import { ToastType } from '../models/toast'
import { Timespan } from '../models/timespan'
import { AuthService } from './auth.service'

@Injectable({
	providedIn: 'root',
})
export class TaskService {
	constructor(private http: HttpClient, private modalService: ModalService, private authService: AuthService) {
		this.authService.user.subscribe(user => {
			if (!user) {
				this.tagsSubject.next([])
				return
			}

			this.getTags()
		})

		setInterval(() => {
			this.trackTimeAndDate()
		}, 10000)
	}

	public lastTaskSync: Date = new Date(0)
	public lastTaskUnwoundSync: Date = new Date(0)
	public lastTagSync: Date = new Date(0)
	private lastNow: Date = new Date()

	private tasksSubject = new Subject<Task>()
	private nowSubject = new Subject<Date>()
	private dateChangeSubject = new Subject<Date>()
	private tagsSubject = new BehaviorSubject<Tag[]>([])

	public tasksObservable = this.tasksSubject.asObservable()
	public now = this.nowSubject.asObservable()
	public dateChangeObservable = this.dateChangeSubject.asObservable()
	public tagsObservable = this.tagsSubject.asObservable()

	private trackTimeAndDate() {
		const newDate = new Date()
		this.lastNow = newDate
		this.nowSubject.next(newDate)

		if (this.lastNow.getDate() !== newDate.getDate()) {
			this.dateChangeSubject.next(newDate)
		}
	}

	public getTasksByDeadlines(sync: boolean = false, page = 0, pageSize = 10, date = new Date()): Observable<TasksGetResponse> {
		date.setHours(0,0,0,0)
		const filters = [
			`isDoneAndDueAt=${date.toISOString()}`,
			`page=${page}`,
			`pageSize=${pageSize}`,
		]

		if (sync) {
			filters.push(`lastModifiedAt=${this.lastTaskSync.toISOString()}`)
			filters.push(`includeDeleted=true`)
		}
		
		this.lastTaskSync = new Date()
		
		const observable = this.http
			.get<TasksGetResponse>(`${environment.apiBaseUrl}/v1/tasks?` + filters.join('&'))
			.pipe(shareReplay(), retry(3), catchError((err) => this.handleError(err)))

		observable.subscribe((response) => {
			if (sync) {
				if (response.pagination.resultCount === 0) {
					return
				}

				response.results.forEach((task) => {
					this.tasksSubject.next(task)
				})
				return
			}
		})

		return observable
	}

	public getAgenda(date: Date, sort = 0, page = 0): Observable<TasksAgendaResponse> {
		const filters = [
			`date=${date.toISOString()}`,
			`sort=${sort}`,
			`pageSize=${25}`,
			`page=${page}`,
		]

		const observable = this.http
			.get<TasksAgendaResponse>(`${environment.apiBaseUrl}/v1/tasks/agenda?` + filters.join('&'))
			.pipe(retry(3), catchError((err) => this.handleError(err)))

		return observable
	}

	public getTag(id: string): Tag | undefined {
		return this.tagsSubject.getValue().find((x) => x.id === id)
	}

	public getTagByValue(value: string): Tag | undefined {
		return this.tagsSubject.getValue().find((x) => x.value === value)
	}

	public getTagsBySearch(value: string): Tag[] {
		return this.tagsSubject
			.getValue()
			.filter((x) => x.value.includes(value))
			.sort((a, b) => {
				return a.value.localeCompare(b.value)
			})
	}

	public getAllTags(): Tag[] {
		return this.tagsSubject.getValue()
	}

	public newTag(tag: TagModified): Observable<Tag> {
		const foundTag = this.tagsSubject.getValue().find((x) => x.value === tag.value)
		if (foundTag) {
			return new Observable<Tag>((s) => {
				s.next(foundTag)
				s.complete()
			})
		}

		const observable = this.http
			.post<Tag>(`${environment.apiBaseUrl}/v1/tags`, JSON.stringify(tag))
			.pipe(share(), catchError((err) => this.handleError(err)))

		observable.subscribe((tag) => {
			const tags = this.tagsSubject.getValue()
			tags.push(tag)
			this.tagsSubject.next(tags)
		})

		return observable
	}

	public static taskToUnwound(task: Task) {
		const tasks: TaskUnwound[] = []

		task.workUnits.forEach((workunit, index) => {
			const unwound = Object.assign({}, task) as TaskUnwound

			unwound.workUnit = workunit
			unwound.workUnitsIndex = index
			unwound.workUnitsCount = task.workUnits.length

			tasks.push(unwound)
		})

		return tasks
	}

	public deleteTagFromTask(id: string): void {
		const newTags = this.tagsSubject.getValue().filter((x) => x.id !== id)
		this.tagsSubject.next(newTags)
	}

	public changeTag(id: string, tag: TagModified): Observable<Tag> {
		const observable = this.http
			.patch<Tag>(`${environment.apiBaseUrl}/v1/tags/${id}`, JSON.stringify(tag))
			.pipe(share(), catchError((err) => this.handleError(err)))

		if (tag.value) {
			const foundTag = this.getTagByValue(tag.value)
			if (foundTag) {
				return new Observable<Tag>((s) => {
					s.next(this.getTag(id))
					s.complete()
				})
			}
		}

		observable.subscribe((updatedTag) => {
			const newTags = this.tagsSubject.getValue().filter((x) => x.id !== id)
			newTags.push(updatedTag)

			this.tagsSubject.next(newTags)
		})

		return observable
	}

	private async getTags(sync?: Date): Promise<void> {
		const filters = [
			'pageSize=25'
		]

		if (sync) {
			filters.push(`lastModifiedAt=${sync.toISOString()}`)
		}

		this.lastTagSync = new Date()

		this.http
			.get<TagsGetResponse>(`${environment.apiBaseUrl}/v1/tags?` + filters.join('&'))
			.pipe(retry(3), catchError((err) => this.handleError(err)))
			.subscribe((response) => {
				if (sync) {
					if (response.pagination.resultCount === 0) {
						return
					}

					let tags: Tag[] = this.tagsSubject.getValue() ?? []

					response.results.forEach((syncTag: Tag) => {
						tags = tags.filter((x) => x.id !== syncTag.id)
					})

					tags.push(...response.results)

					this.tagsSubject.next(tags)
					return
				}

				this.tagsSubject.next(response.results)
			})
	}

	public getTasksByWorkunits(sync?: Date, page = 0, pageSize = 10): Observable<TasksByWorkunitsGetResponse> {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const filters = [
			'workUnit.isDone=false',
			`isDoneAndScheduledAt=${today.toISOString()}`,
			`page=${page}`,
			`pageSize=${pageSize}`,
		]

		if (sync) {
			filters.push(`lastModifiedAt=${sync.toISOString()}`)
			filters.push(`includeDeleted=true`)
		}

		this.lastTaskUnwoundSync = new Date()

		return this.http
			.get<TasksByWorkunitsGetResponse>(`${environment.apiBaseUrl}/v1/tasks/workunits?` + filters.join('&'))
			.pipe(retry(3), catchError((err) => this.handleError(err)))
	}

	public getTask(id: string): Observable<Task> {
		return this.http
			.get<Task>(`${environment.apiBaseUrl}/v1/tasks/` + id)
			.pipe(retry(3), catchError((err) => this.handleError(err)))
	}

	public getTaskBetween(from: Date, to: Date): Observable<{count: number}> {
		const query = [
			`from=${from.toISOString()}`,
			`to=${to.toISOString()}`,
		]

		return this.http
			.get<{count: number}>(`${environment.apiBaseUrl}/v1/tasks/between?` + query.join('&'))
			.pipe(retry(3), catchError((err) => this.handleError(err)))
	}

	public getWorkUnitsBetween(from: Date, to: Date): Observable<{count: number}> {
		const query = [
			`from=${from.toISOString()}`,
			`to=${to.toISOString()}`,
		]

		return this.http
			.get<{count: number}>(`${environment.apiBaseUrl}/v1/tasks/workunits/between?` + query.join('&'))
			.pipe(retry(3), catchError((err) => this.handleError(err)))
	}

	public patchTask(id: string, task: TaskModified): Observable<Task> {
		const observable = this.http
			.patch<Task>(`${environment.apiBaseUrl}/v1/tasks/${id}`, JSON.stringify(task))
			.pipe(share(), catchError((err) => this.handleError(err)))

		observable.subscribe((task) => {
			this.tasksSubject.next(task)
		})

		return observable
	}

	public newTask(task: TaskModified): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks`, JSON.stringify(task))
			.pipe(share(), catchError((err) => this.handleError(err)))

		observable.subscribe((task) => {
			this.tasksSubject.next(task)
		})

		return observable
	}

	public deleteTask(task: Task): Observable<void> {
		const observable = this.http
			.delete<void>(`${environment.apiBaseUrl}/v1/tasks/${task.id}`)
			.pipe(share(), catchError((err) => this.handleError(err)))

		observable.subscribe(() => {
			task.deleted = true
			this.tasksSubject.next(task)
		})
		return observable
	}

	public markWorkUnitAsDone(task: Task, workUnitIndex: number, done = true, timeLeft: Duration): Observable<Task> {
		const observable = this.http
			.patch<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitIndex}/done`, { isDone: done, timeLeft: timeLeft.toNanoseconds() })
			.pipe(share(), catchError((err) => this.handleError(err)))

		observable.subscribe((newTask) => {
			// TODO save in task cache
			this.tasksSubject.next(newTask)
		})
		return observable
	}

	public rescheduleWorkUnitWithTimespans(task: Task, workUnitIndex: number, timespans: Timespan[]): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitIndex}/reschedule`, { chosenTimespans: timespans })
			.pipe(share(), catchError((err) => this.handleError(err)))

		observable.subscribe((newTask) => {
			// TODO save in task cache
			this.tasksSubject.next(newTask)
		})
		return observable
	}

	public rescheduleWorkUnit(task: Task, index: number): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${index}/reschedule`, {})
			.pipe(share(), catchError((err) => this.handleError(err)))

		observable.subscribe((newTask) => {
			// TODO save in task cache
			this.tasksSubject.next(newTask)
		})
		return observable
	}

	public fetchReschedulingSuggestions(task: Task, workUnitIndex: number): Observable<Timespan[][]> {
		const observable = this.http
			.get<Timespan[][]>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitIndex}/reschedule`, {})
			.pipe(share(), catchError((err) => this.handleError(err)))

		return observable
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
		const apiError = error.error as ApiError
		
		console.error(`API returned a bad response: ${apiError.error} with status ${apiError.status}`)
		
		let userMessage = `We\'ve encountered an error: ${apiError.error.message}`

		this.modalService.newToast(ToastType.Error, userMessage)
		// Return an observable with a user-facing error message.
		return throwError(userMessage)
	}
}

interface TasksGetResponse {
	pagination: Pagination
	results: Task[]
}

interface TasksAgendaResponse {
	pagination: Pagination
	results: TaskAgenda[]
}

interface TasksByWorkunitsGetResponse {
	pagination: Pagination
	results: TaskUnwound[]
}

interface TagsGetResponse {
	pagination: Pagination
	results: Tag[]
}
