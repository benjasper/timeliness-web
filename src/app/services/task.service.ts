import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs'
import { catchError, retry, share, shareReplay, tap, windowTime } from 'rxjs/operators'
import { Duration, DurationUnit } from '../models/duration'
import { Pagination } from '../models/paginations'
import { CalendarType, PersistedEvent, Task, TaskAgenda, TaskModified, TaskUnwound } from '../models/task'
import { environment } from '../../environments/environment'
import { WorkUnit } from '../models/workunit'
import { element } from 'protractor'
import { Tag, TagModified } from '../models/tag'
import { ApiError, ApiErrorTypes } from '../models/error'
import { ModalService } from './modal.service'
import { Toast, ToastType } from '../models/toast'
import { Timespan } from '../models/timespan'
import { AuthService } from './auth.service'
import { Router } from '@angular/router'
import { Filter, FilterConfig, FilterTypes } from '../core/components/filter/filter.component'
import { AgendaEventType } from '../models/event'

@Injectable({
	providedIn: 'root',
})
export class TaskService {
	constructor(
		private http: HttpClient,
		private modalService: ModalService,
		private authService: AuthService,
		private router: Router
	) {
		this.authService.user.subscribe((user) => {
			if (!user) {
				this.tagsSubject.next([])
				return
			}

			this.getTags()
		})

		setInterval(() => {
			this.trackTimeAndDate()
		}, 2000)
	}

	static agendaFilterConfig = [
		new FilterConfig(
			'isDone',
			'Task completed',
			[
				{ label: 'Task is completed', value: 'true', operator: '$eq', isConstant: true },
				{ label: 'Task is not completed', value: 'false', operator: '$eq', isConstant: true },
			],
			'icon-deadline',
			FilterTypes.Boolean
		),
		new FilterConfig(
			'tags',
			'Tags',
			[
				{ label: 'Contains', value: '', operator: '$eq', isConstant: false },
				{ label: 'Does not contain', value: '', operator: '$ne', isConstant: false },
			],
			'icon-tag',
			FilterTypes.Tags
		),
		new FilterConfig(
			'date.type',
			'Event type',
			[
				{ label: 'Is type do date', value: AgendaEventType.WorkUnit, operator: '$eq', isConstant: true },
				{ label: 'Is type deadline', value: AgendaEventType.DueAt, operator: '$eq', isConstant: true },
			],
			'icon-deadline',
			FilterTypes.Boolean
		),
	]

	static workUnitFilterConfig = [
		new FilterConfig(
			'tags',
			'Tags',
			[
				{ label: 'Contains', value: '', operator: '$eq', isConstant: false },
				{ label: 'Does not contain', value: '', operator: '$ne', isConstant: false },
			],
			'icon-tag',
			FilterTypes.Tags
		),
	]

	static deadlinesFilterConfig = [
		new FilterConfig(
			'isDone',
			'Task completed',
			[
				{ label: 'Task is completed', value: 'true', operator: '$eq', isConstant: true },
				{ label: 'Task is not completed', value: 'false', operator: '$eq', isConstant: true },
			],
			'icon-deadline',
			FilterTypes.Boolean
		),
		new FilterConfig(
			'tags',
			'Tags',
			[
				{ label: 'Contains', value: '', operator: '$eq', isConstant: false },
				{ label: 'Does not contain', value: '', operator: '$ne', isConstant: false },
			],
			'icon-tag',
			FilterTypes.Tags
		),
	]

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

	public getTasksByDeadlines(
		sync: boolean = false,
		page = 0,
		pageSize = 10,
		date = new Date(),
		filter: Filter[] = []
	): Observable<TasksGetResponse> {
		date.setHours(0, 0, 0, 0)
		const filters: string[] = [
			`isDoneAndDueAt=${date.toISOString()}`,
			`page=${page}`,
			`pageSize=${pageSize}`,
			...Filter.filtersToQueryParameter(filter, TaskService.deadlinesFilterConfig),
		]

		if (sync) {
			filters.push(`lastModifiedAt=${this.lastTaskSync.toISOString()}`)
			filters.push(`includeDeleted=true`)
		}

		this.lastTaskSync = new Date()

		const observable = this.http
			.get<TasksGetResponse>(`${environment.apiBaseUrl}/v1/tasks?` + filters.join('&'))
			.pipe(
				shareReplay(),
				catchError((err) => this.handleError(err))
			)

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

	public getAgenda(date: Date, sort = 0, page = 0, pageSize = 20, filter: Filter[]): Observable<TasksAgendaResponse> {
		const filters: string[] = [
			`date=${date.toISOString()}`,
			`sort=${sort}`,
			`pageSize=${pageSize}`,
			`page=${page}`,
			...Filter.filtersToQueryParameter(filter, TaskService.agendaFilterConfig),
		]

		const observable = this.http
			.get<TasksAgendaResponse>(`${environment.apiBaseUrl}/v1/tasks/agenda?` + filters.join('&'))
			.pipe(catchError((err) => this.handleError(err)))

		this.lastTaskSync = new Date()

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

		const observable = this.http.post<Tag>(`${environment.apiBaseUrl}/v1/tags`, JSON.stringify(tag)).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

		observable.subscribe((tag) => {
			const tags = this.tagsSubject.getValue()
			tags.push(tag)
			this.tagsSubject.next(tags)
		})

		return observable
	}

	public deleteTag(tagId: string): Observable<Object> {
		const observable = this.http.delete(`${environment.apiBaseUrl}/v1/tags/${tagId}`).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

		observable.subscribe(() => {
			const tags = this.tagsSubject.getValue()
			tags.splice(
				tags.findIndex((x) => x.id === tagId),
				1
			)
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

	public changeTag(id: string, tag: TagModified): Observable<Tag> {
		const observable = this.http.patch<Tag>(`${environment.apiBaseUrl}/v1/tags/${id}`, JSON.stringify(tag)).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

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
		const filters = ['pageSize=100']

		if (sync) {
			filters.push(`lastModifiedAt=${sync.toISOString()}`)
		}

		this.lastTagSync = new Date()

		this.http
			.get<TagsGetResponse>(`${environment.apiBaseUrl}/v1/tags?` + filters.join('&'))
			.pipe(catchError((err) => this.handleError(err)))
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

	public getTasksByWorkunits(
		sync?: Date,
		page = 0,
		pageSize = 10,
		filter: Filter[] = []
	): Observable<TasksByWorkunitsGetResponse> {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const filters: string[] = [
			'workUnit.isDone=false',
			`isDoneAndScheduledAt=${today.toISOString()}`,
			`page=${page}`,
			`pageSize=${pageSize}`,
			...Filter.filtersToQueryParameter(filter, TaskService.workUnitFilterConfig),
		]

		if (sync) {
			filters.push(`lastModifiedAt=${sync.toISOString()}`)
			filters.push(`includeDeleted=true`)
		}

		this.lastTaskUnwoundSync = new Date()

		return this.http
			.get<TasksByWorkunitsGetResponse>(`${environment.apiBaseUrl}/v1/tasks/workunits?` + filters.join('&'))
			.pipe(catchError((err) => this.handleError(err)))
	}

	public getTask(id: string): Observable<Task> {
		return this.http
			.get<Task>(`${environment.apiBaseUrl}/v1/tasks/` + id)
			.pipe(catchError((err) => this.handleError(err)))
	}

	public getTaskDueDateCalendarData(id: string): Observable<PersistedEvent> {
		return this.http
			.get<PersistedEvent>(`${environment.apiBaseUrl}/v1/tasks/${id}/calendar`)
			.pipe(catchError((err) => this.handleError(err)))
	}

	public getWorkUnitDateCalendarData(taskId: string, workUnitId: string): Observable<PersistedEvent> {
		return this.http
			.get<PersistedEvent>(`${environment.apiBaseUrl}/v1/tasks/${taskId}/workunits/${workUnitId}/calendar`)
			.pipe(catchError((err) => this.handleError(err)))
	}

	public getLinkToCalendarEvent(persistedEvent: PersistedEvent): string {
		switch (persistedEvent.calendarType) {
			case CalendarType.GoogleCalendar:
				return `https://www.google.com/calendar/event?eid=${persistedEvent.calendarEventId}`
		}
	}

	public getTaskBetween(from: Date, to: Date): Observable<{ count: number }> {
		const query = [`from=${from.toISOString()}`, `to=${to.toISOString()}`]

		return this.http
			.get<{ count: number }>(`${environment.apiBaseUrl}/v1/tasks/between?` + query.join('&'))
			.pipe(catchError((err) => this.handleError(err)))
	}

	public getWorkUnitsBetween(from: Date, to: Date): Observable<{ count: number }> {
		const query = [`from=${from.toISOString()}`, `to=${to.toISOString()}`]

		return this.http
			.get<{ count: number }>(`${environment.apiBaseUrl}/v1/tasks/workunits/between?` + query.join('&'))
			.pipe(catchError((err) => this.handleError(err)))
	}

	public patchTask(id: string, task: TaskModified): Observable<Task> {
		const observable = this.http.patch<Task>(`${environment.apiBaseUrl}/v1/tasks/${id}`, JSON.stringify(task)).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

		observable.subscribe((task) => {
			this.tasksSubject.next(task)
		})

		return observable
	}

	public newTask(task: TaskModified): Observable<Task> {
		const observable = this.http.post<Task>(`${environment.apiBaseUrl}/v1/tasks`, JSON.stringify(task)).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

		observable.subscribe((task) => {
			this.tasksSubject.next(task)
		})

		return observable
	}

	public deleteTask(task: Task): Observable<void> {
		const observable = this.http.delete<void>(`${environment.apiBaseUrl}/v1/tasks/${task.id}`).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

		observable.subscribe(() => {
			task.deleted = true
			this.tasksSubject.next(task)
		})
		return observable
	}

	public markWorkUnitAsDone(task: Task, workUnitId: string, done = true, timeLeft: Duration): Observable<Task> {
		const observable = this.http
			.patch<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitId}/done`, {
				isDone: done,
				timeLeft: timeLeft.toNanoseconds(),
			})
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		observable.subscribe((newTask) => {
			// TODO save in task cache
			this.tasksSubject.next(newTask)
		})
		return observable
	}

	public rescheduleWorkUnitWithTimespans(task: Task, workUnitId: string, timespans: Timespan[]): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitId}/reschedule`, {
				chosenTimespans: timespans,
			})
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		observable.subscribe((newTask) => {
			// TODO save in task cache
			this.tasksSubject.next(newTask)
		})
		return observable
	}

	public rescheduleWorkUnit(task: Task, workUnitId: string): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitId}/reschedule`, {})
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		observable.subscribe((newTask) => {
			// TODO save in task cache
			this.tasksSubject.next(newTask)
		})
		return observable
	}

	public fetchReschedulingSuggestions(
		task: Task,
		workUnitId: string,
		timespans: Timespan[]
	): Observable<Timespan[][]> {
		let observable
		if (timespans.length === 0) {
			observable = this.http
				.get<Timespan[][]>(
					`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitId}/reschedule`,
					{}
				)
				.pipe(
					share(),
					catchError((err) => this.handleError(err))
				)
		} else {
			observable = this.http
				.patch<Timespan[][]>(
					`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitId}/reschedule`,
					{ ignoreTimespans: timespans }
				)
				.pipe(
					share(),
					catchError((err) => this.handleError(err))
				)
		}

		return observable
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
		const apiError = error.error as ApiError

		console.error(
			`API returned a bad response: ${apiError.error} with status ${apiError.status} and trackId ${apiError.error.trackId}`
		)

		let userMessage = `We\'ve encountered a problem: ${apiError.error.message}`

		const toast = new Toast(ToastType.Error, userMessage, true, 0)
		toast.trackId = apiError.error.trackId
		this.modalService.addToast(toast)

		if (apiError.error.type === ApiErrorTypes.Calendar) {
			this.router.navigate(['/settings/calendars'])
		}

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
