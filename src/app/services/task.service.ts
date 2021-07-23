import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs'
import { catchError, retry, share, tap, windowTime } from 'rxjs/operators'
import { DurationUnit } from '../models/duration'
import { Pagination } from '../models/paginations'
import { Task, TaskModified, TaskUnwound } from '../models/task'
import { environment } from '../../environments/environment'
import { WorkUnit } from '../models/workunit'
import { element } from 'protractor'

@Injectable({
	providedIn: 'root',
})
export class TaskService {
	constructor(private http: HttpClient) {
		this.refreshTasks()
		this.refreshTasksUnwound()
		setInterval(() => {
			this.nowSubject.next(new Date())
		}, 30000)

		setInterval(() => {
			this.getTasksByDeadlines(this.lastTaskSync)
			this.getTasksByWorkunits(this.lastTaskUnwoundSync)
		}, 60000)
	}

	public lastTaskSync: Date = new Date(0)
	public lastTaskUnwoundSync: Date = new Date(0)

	private tasksSubject = new BehaviorSubject<Task[] | undefined>(undefined)
	private tasksUnwoundSubject = new BehaviorSubject<TaskUnwound[] | undefined>(undefined)
	private nowSubject = new Subject<Date>()

	public tasksObservalble = this.tasksSubject.asObservable()
	public tasksUnwoundObservalble = this.tasksUnwoundSubject.asObservable()
	public now = this.nowSubject.asObservable()

	public refreshTasks(): void {
		this.tasksSubject.next(undefined)
		this.getTasksByDeadlines()
	}

	public refreshTasksUnwound(): void {
		this.tasksUnwoundSubject.next(undefined)
		this.getTasksByWorkunits()
	}

	private publishTasks(tasks: Task[]): void {
		this.tasksSubject.next(undefined)
		this.tasksSubject.next(tasks)
	}

	private publishTasksUnwound(tasks: TaskUnwound[]): void {
		this.tasksUnwoundSubject.next(undefined)
		this.tasksUnwoundSubject.next(tasks)
	}

	private async getTasksByDeadlines(sync?: Date): Promise<void> {
		const filters = [`dueAt.date.start=${new Date().toISOString()}`]

		if (sync) {
			filters.push(`lastModifiedAt=${sync.toISOString()}`)
		}

		this.lastTaskSync = new Date()

		this.http
			.get<TasksGetResponse>(`${environment.apiBaseUrl}/v1/tasks?` + filters.join('&'))
			.pipe(retry(3), catchError(this.handleError))
			.subscribe((response) => {
				if (sync) {
					if (response.pagination.resultCount === 0) {
						return
					}

					let tasks: Task[] = this.tasksSubject.getValue() ?? []

					response.results.forEach((syncTask: Task) => {
						tasks = tasks.filter((x) => x.id !== syncTask.id)
					})

					tasks.push(...response.results)

					tasks.sort((a, b) => {
						return a.dueAt.date.start.toDate().getTime() - b.dueAt.date.end.toDate().getTime()
					})

					this.publishTasks(tasks)
					return
				}

				this.publishTasks(response.results)
			})
	}

	private async getTasksByWorkunits(sync?: Date): Promise<void> {
		const filters = ['workUnit.isDone=false']

		if (sync) {
			filters.push(`lastModifiedAt=${sync.toISOString()}`)
		}

		this.lastTaskUnwoundSync = new Date()

		this.http
			.get<TasksByWorkunitsGetResponse>(`${environment.apiBaseUrl}/v1/tasks/workunits?` + filters.join('&'))
			.pipe(retry(3), catchError(this.handleError))
			.subscribe((response) => {
				if (sync) {
					if (response.pagination.resultCount === 0) {
						return
					}

					let tasks = this.tasksUnwoundSubject.getValue() ?? []

					response.results.forEach((syncTask: TaskUnwound) => {
						tasks = tasks.filter((x) => x.id !== syncTask.id)
					})

					tasks.push(...response.results)

					tasks.sort((a, b) => {
						return (
							a.workUnits[a.workUnitsIndex].scheduledAt.date.start.toDate().getTime() -
							b.workUnits[b.workUnitsIndex].scheduledAt.date.start.toDate().getTime()
						)
					})

					this.publishTasksUnwound(tasks)
					return
				}

				this.publishTasksUnwound(response.results)
			})
	}

	public getTask(id: string): Observable<Task> {
		const foundTask = this.tasksSubject.getValue()?.find((x) => x.id === id)
		if (foundTask) {
			return new Observable((sub) => {
				sub.next(foundTask)
				sub.complete()
			})
		}

		return this.http
			.get<Task>(`${environment.apiBaseUrl}/v1/tasks/` + id)
			.pipe(retry(3), catchError(this.handleError))
	}

	public patchTask(id: string, task: TaskModified): Observable<Task> {
		const observable = this.http
			.patch<Task>(`${environment.apiBaseUrl}/v1/tasks/${id}`, JSON.stringify(task))
			.pipe(share(), catchError(this.handleError))

		observable.subscribe(() => {
			this.getTasksByWorkunits(this.lastTaskUnwoundSync)
			this.getTasksByDeadlines(this.lastTaskSync)
		})

		return observable
	}

	public newTask(task: TaskModified): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks`, JSON.stringify(task))
			.pipe(share(), catchError(this.handleError))

		observable.subscribe(() => {
			this.getTasksByWorkunits(this.lastTaskUnwoundSync)
			this.getTasksByDeadlines(this.lastTaskSync)
		})

		return observable
	}

	public deleteTask(id: string): Observable<void> {
		const observable = this.http
			.delete<void>(`${environment.apiBaseUrl}/v1/tasks/${id}`)
			.pipe(share(), catchError(this.handleError))

		observable.subscribe(() => {
			const tasksUnwound = this.tasksUnwoundSubject.getValue()?.filter((newElement) => {
				return newElement.id !== id
			})

			const tasks = this.tasksSubject.getValue()?.filter((newElement) => {
				return newElement.id !== id
			})

			this.publishTasks(tasks ?? [])
			this.publishTasksUnwound(tasksUnwound ?? [])
		})
		return observable
	}

	public markWorkUnitAsDone(task: Task, workUnitIndex: number, done = true): Observable<Task> {
		const observable = this.http
			.patch<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitIndex}`, { isDone: done })
			.pipe(share(), catchError(this.handleError))

		observable.subscribe((newTask) => {
			// TODO save in task cache
			this.getTasksByWorkunits(this.lastTaskUnwoundSync)
			this.getTasksByDeadlines(this.lastTaskSync)

			if (done === true) {
				const tasks = this.tasksUnwoundSubject.getValue()?.filter((x) => {
					return !(x.id === newTask.id && x.workUnitsIndex === workUnitIndex)
				})
				this.publishTasksUnwound(tasks ?? [])
			}
		})
		return observable
	}

	public rescheduleWorkUnit(task: Task, index: number): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${index}/reschedule`, {})
			.pipe(share(), catchError(this.handleError))

		observable.subscribe(() => {
			// TODO save in task cache
			this.getTasksByWorkunits(this.lastTaskUnwoundSync)
			this.getTasksByDeadlines(this.lastTaskSync)
		})
		return observable
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message)
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong.
			console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`)
		}
		// Return an observable with a user-facing error message.
		return throwError('Something bad happened; please try again later.')
	}
}

interface TasksGetResponse {
	pagination: Pagination
	results: Task[]
}

interface TasksByWorkunitsGetResponse {
	pagination: Pagination
	results: TaskUnwound[]
}
