import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError, retry } from 'rxjs/operators'
import { DurationUnit } from '../models/duration'
import { Pagination } from '../models/paginations'
import { Task, TaskUnwound } from '../models/task'

@Injectable({
	providedIn: 'root',
})
export class TaskService {
	constructor(private http: HttpClient) {}

	public getTasksByDeadlines(): Observable<TasksGetResponse> {
		return this.http
			.get<TasksGetResponse>('http://localhost/v1/tasks')
			.pipe(retry(3), catchError(this.handleError))
	}

	public getTasksByWorkunits(): Observable<TasksByWorkunitsGetResponse> {
		return this.http
			.get<TasksByWorkunitsGetResponse>('http://localhost/v1/tasks/workunits')
			.pipe(retry(3), catchError(this.handleError))
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
