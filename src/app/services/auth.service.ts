import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs'
import { catchError, retry, share, tap, windowTime } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { User } from '../models/user'

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private http: HttpClient, private router: Router) {}

	private accessToken = ''
	private refreshToken = ''
	private decodedAccessToken?: JwtPayload = undefined

	private userSubject = new BehaviorSubject<User|undefined>(undefined)
	private userObservable = this.userSubject.asObservable()

	public authenticate(credentials: { email: string; password: string }): Observable<AuthResponse> {
		const observable = this.http
			.post<AuthResponse>(`${environment.apiBaseUrl}/v1/auth/login`, JSON.stringify(credentials))
			.pipe(share(), catchError(this.handleError))

		observable.subscribe((response) => {
			this.setAccessToken(response.accessToken)
			this.setRefreshToken(response.refreshToken)
			this.userSubject.next(response.result)
		})

		return observable
	}

	get user(): Observable<User|undefined> {
		if (!this.userSubject.getValue()) {
			this.fetchUser()
		}

		return this.userObservable
	}

	public forceUserUpdate() {
		this.fetchUser()
	}

	public logout(): void {
		this.accessToken = ''
		this.refreshToken = ''
		this.decodedAccessToken = undefined

		localStorage.clear()
		this.router.navigate(['signin'])
	}

	public refreshAccessToken(): Observable<{ accessToken: string }> {
		if (this.refreshToken === '') {
			throwError(new Error('No refresh token'))
		}

		const observable = this.http
			.post<{ accessToken: string }>(
				`${environment.apiBaseUrl}/v1/auth/refresh`,
				JSON.stringify({ refreshToken: this.refreshToken })
			)
			.pipe(
				share(),
				catchError((err, caught) => {
					this.logout()
					return throwError('Refresh was not successful.')
				})
			)

		observable.subscribe((response) => {
			this.setAccessToken(response.accessToken)
		})

		return observable
	}

	private fetchUser() {
		const observable = this.http
			.get<User>(
				`${environment.apiBaseUrl}/v1/user`
			)
			.pipe(
				share(),
				catchError(this.handleError)
			)

		observable.subscribe((response) => {
			this.userSubject.next(response)
		})

		return observable
	}
	
	public connectGoogleCalendar() {
		const observable = this.http
			.post<{url: string}>(
				`${environment.apiBaseUrl}/v1/calendar/google/connect`, undefined
			)
			.pipe(
				share(),
				catchError(this.handleError)
			)

		return observable
	}

	public isAccessTokenExpired(): boolean {
		if (this.accessToken === '') {
			return true
		}

		if (!this.decodedAccessToken) {
			this.decodedAccessToken = jwtDecode<JwtPayload>(this.accessToken)
		}

		if (!((this.decodedAccessToken?.exp ?? 0) > Math.floor(Date.now() / 1000))) {
			this.accessToken = ''
			this.decodedAccessToken = undefined
			return true
		}

		return false
	}

	private setAccessToken(accessToken: string): void {
		this.accessToken = accessToken
		this.decodedAccessToken = jwtDecode<JwtPayload>(this.accessToken)
		localStorage.setItem('accessToken', accessToken)
	}

	private setRefreshToken(refreshToken: string): void {
		this.refreshToken = refreshToken
		localStorage.setItem('refreshToken', refreshToken)
	}

	public isLoggedIn(): boolean {
		if (this.refreshToken !== '') {
			return true
		}

		const accessToken = localStorage.getItem('accessToken') ?? ''
		const refreshToken = localStorage.getItem('refreshToken') ?? ''

		if (refreshToken !== '') {
			this.accessToken = accessToken
			this.refreshToken = refreshToken
			return true
		}

		return false
	}

	public getAccessToken(): string {
		return this.accessToken
	}

	public getRefreshToken(): string {
		return this.refreshToken
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
		return throwError('Sign in was not successful.')
	}
}

interface AuthResponse {
	accessToken: string
	refreshToken: string
	result: User
}
