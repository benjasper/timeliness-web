import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs'
import { catchError, retry, tap, windowTime } from 'rxjs/operators'
import { DurationUnit } from '../models/duration'
import { Pagination } from '../models/paginations'
import { Task, TaskUnwound } from '../models/task'

@Injectable({
	providedIn: 'root',
})
export class TaskService {
	constructor(private http: HttpClient) {
		this.getTasksByDeadlines()
		this.getTasksByWorkunits()
	}

	public tasks: Task[] = []
	public tasksUnwound: TaskUnwound[] = []

	private tasksSubject = new Subject<Task[]>()
	private tasksUnwoundSubject = new Subject<TaskUnwound[]>()

	public tasksObservalble = this.tasksSubject.asObservable()
	public tasksUnwoundObservalble = this.tasksUnwoundSubject.asObservable()

	public async getTasksByDeadlines(): Promise<void> {
		this.http
			.get<TasksGetResponse>('http://localhost/v1/tasks')
			.pipe(retry(3), catchError(this.handleError))
			.subscribe((response) => {
				this.tasks.push(...response.results)
				this.tasksSubject.next(response.results)
			})
	}

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

	public async getTasksByWorkunits(): Promise<void> {
		this.http
			.get<TasksByWorkunitsGetResponse>('http://localhost/v1/tasks/workunits')
			.pipe(retry(3), catchError(this.handleError))
			.subscribe((response) => {
				this.tasksUnwound.push(...response.results)
				this.tasksUnwoundSubject.next(this.tasksUnwound)
			})
	}

	public getTask(id: string): Observable<Task> {
		return this.http.get<Task>('http://localhost/v1/tasks/' + id).pipe(retry(3), catchError(this.handleError))
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
