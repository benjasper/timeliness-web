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
	constructor(private http: HttpClient) {}

	public tasks: Task[] = []
	public tasksUnwound: TaskUnwound[] = []

	private tasksSubject = new Subject<Task[]>()
	private tasksUnwoundSubject = new Subject<TaskUnwound[]>()

	public tasksObservalble = this.tasksSubject.asObservable()
	public tasksUnwoundObservalble = this.tasksUnwoundSubject.asObservable()

	public refreshTasks(): void {
		this.tasks = []
		this.tasksSubject.next()
		this.getTasksByDeadlines()
	}

	public refreshTasksUnwound(): void {
		this.tasksUnwound = []
		this.tasksUnwoundSubject.next()
		this.getTasksByWorkunits()
	}

	private publishTasks(): void {
		this.tasksSubject.next()
		this.tasksSubject.next(this.tasks)
	}

	private publishTasksUnwound(): void {
		this.tasksUnwoundSubject.next()
		this.tasksUnwoundSubject.next(this.tasksUnwound)
	}

	private async getTasksByDeadlines(): Promise<void> {
		const filters = [`dueAt.date.start=${new Date().toISOString()}`]
		this.http
			.get<TasksGetResponse>(`${environment.apiBaseUrl}/v1/tasks?` + filters.join('&'))
			.pipe(retry(3), catchError(this.handleError))
			.subscribe((response) => {
				this.tasks.push(...response.results)
				this.tasksSubject.next(response.results)
			})
	}

	private async getTasksByWorkunits(): Promise<void> {
		const filters = ['workUnit.isDone=false']

		this.http
			.get<TasksByWorkunitsGetResponse>(`${environment.apiBaseUrl}/v1/tasks/workunits?` + filters.join('&'))
			.pipe(retry(3), catchError(this.handleError))
			.subscribe((response) => {
				this.tasksUnwound.push(...response.results)
				this.tasksUnwoundSubject.next(this.tasksUnwound)
			})
	}

	public getTask(id: string): Observable<Task> {
		const foundTask = this.tasks.find((x) => x.id === id)
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

		observable.subscribe((task) => {
			this.refreshTasks()
			this.refreshTasksUnwound()
		})

		return observable
	}

	public newTask(task: TaskModified): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks`, JSON.stringify(task))
			.pipe(share(), catchError(this.handleError))

		observable.subscribe((task) => {
			this.refreshTasks()
			this.refreshTasksUnwound()
		})

		return observable
	}

	public deleteTask(id: string): Observable<void> {
		const observable = this.http
			.delete<void>(`${environment.apiBaseUrl}/v1/tasks/${id}`)
			.pipe(share(), catchError(this.handleError))

		observable.subscribe(() => {
			this.tasksUnwound = this.tasksUnwound.filter(element => {
				return element.id !== id
			});

			this.tasks = this.tasks.filter(element => {
				return element.id !== id
			});

			this.publishTasks()
			this.publishTasksUnwound()
		})
		return observable
	}

	public markWorkUnitAsDone(task: Task, workUnitIndex: number, done = true): Observable<Task> {
		const observable = this.http
			.patch<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${workUnitIndex}`, { isDone: done })
			.pipe(share(), catchError(this.handleError))

		observable.subscribe((task) => {
			// TODO save in task cache
			this.refreshTasks()
			this.refreshTasksUnwound()
		})
		return observable
	}

	public rescheduleWorkUnit(task: Task, index: number): Observable<Task> {
		const observable = this.http
			.post<Task>(`${environment.apiBaseUrl}/v1/tasks/${task.id}/workunits/${index}/reschedule`, {})
			.pipe(share(), catchError(this.handleError))

		observable.subscribe((task) => {
			// TODO save in task cache
			this.refreshTasks()
			this.refreshTasksUnwound()
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
