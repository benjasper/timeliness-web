import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs'
import { catchError, retry, share, tap, windowTime } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { User } from '../models/user'

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private http: HttpClient) {}

	private accessToken = ''

	public authenticate(credentials: { email: string; password: string }): Observable<AuthResponse> {
		const observable = this.http
			.post<AuthResponse>(`${environment.apiBaseUrl}/v1/auth/login`, JSON.stringify(credentials))
			.pipe(share(), catchError(this.handleError))

		observable.subscribe((response) => {
			this.setAccessToken(response.accessToken)
		})

		return observable
	}

	private setAccessToken(accessToken: string): void {
		this.accessToken = accessToken
		localStorage.setItem('accessToken', accessToken)
	}

	public isLoggedIn(): boolean {
		if (this.accessToken !== '') {
			return true
		}

		const accessToken = localStorage.getItem('accessToken') ?? ''

		if (accessToken !== '') {
			this.accessToken = accessToken
			return true
		}

		return false
	}

	public getAccessToken(): string {
		return this.accessToken
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
		return throwError('Sign in was not successful.')
	}
}

interface AuthResponse {
	accessToken: string
	result: User
}
