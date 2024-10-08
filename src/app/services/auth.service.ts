import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs'
import { catchError, retry, share, shareReplay, tap, windowTime } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { ApiError, ApiErrorTypes } from '../models/error'
import { Toast, ToastType } from '../models/toast'
import { User, UserSettings } from '../models/user'
import { ModalService } from './modal.service'

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private http: HttpClient, private router: Router, private modalService: ModalService) {}

	private accessToken = ''
	private refreshToken = ''
	private decodedAccessToken?: JwtPayload = undefined

	private userSubject = new BehaviorSubject<User | undefined>(undefined)
	private userObservable = this.userSubject.asObservable()

	private userRequestInProgress = false

	public paymentOptions = {
		monthly: {
			production: 'price_1L8TZfFpCYtlYDc5iXAOdQBP',
			price: '1,99€',
			testing: 'price_1KkWUEFpCYtlYDc5hWg0jpta',
		},
		yearly: {
			production: 'price_1L8TZBFpCYtlYDc5p8ZYE2wR',
			price: '19,99€',
			testing: 'price_1KkWUEFpCYtlYDc5CJZPRoKD',
		},
	}

	public authenticate(credentials: { email: string; password: string }): Observable<AuthResponse> {
		const observable = this.http
			.post<AuthResponse>(`${environment.apiBaseUrl}/v1/auth/login`, JSON.stringify(credentials))
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		observable.subscribe((response) => {
			this.setAccessToken(response.accessToken)
			this.setRefreshToken(response.refreshToken)
			this.userSubject.next(response.result)
		})

		return observable
	}

	public authenticateWithGoogleToken(token: string): Observable<AuthResponse> {
		const observable = this.http
			.post<AuthResponse>(`${environment.apiBaseUrl}/v1/auth/login/google`, JSON.stringify({ token: token }))
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		observable.subscribe((response) => {
			this.setAccessToken(response.accessToken)
			this.setRefreshToken(response.refreshToken)
			this.userSubject.next(response.result)
		})

		return observable
	}

	public register(credentials: {
		firstname: string
		lastname: string
		email: string
		password: string
	}): Observable<AuthResponse> {
		const observable = this.http
			.post<AuthResponse>(`${environment.apiBaseUrl}/v1/auth/register`, JSON.stringify(credentials))
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		observable.subscribe((response) => {
			this.setAccessToken(response.accessToken)
			this.setRefreshToken(response.refreshToken)
			this.userSubject.next(response.result)
		})

		return observable
	}

	get user(): Observable<User | undefined> {
		if (!this.userSubject.getValue() && this.isLoggedIn() && !this.userRequestInProgress) {
			this.fetchUser()
		}

		return this.userObservable
	}

	public forceUserUpdate(): Observable<User> {
		return this.fetchUser()
	}

	public logout(): void {
		this.accessToken = ''
		this.refreshToken = ''
		this.decodedAccessToken = undefined
		this.userSubject.next(undefined)

		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')

		this.router.navigate(['/auth/signin'])
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
					console.error(err)
					return throwError('Refresh was not successful.')
				})
			)

		observable.subscribe((response) => {
			this.setAccessToken(response.accessToken)
		})

		return observable
	}

	private fetchUser() {
		this.userRequestInProgress = true
		const observable = this.http.get<User>(`${environment.apiBaseUrl}/v1/user`).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

		observable.subscribe(
			(response) => {
				this.userSubject.next(response)
			},
			undefined,
			() => {
				this.userRequestInProgress = false
			}
		)

		return observable
	}

	public fetchCalendarsByConnection(connectionId: string) {
		const observable = this.http
			.get<{ calendars: Calendars }>(`${environment.apiBaseUrl}/v1/connections/${connectionId}/calendars`)
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		return observable
	}

	public updateCalendarsForConnection(connectionId: string, calendar: Calendars) {
		const observable = this.http
			.put(`${environment.apiBaseUrl}/v1/connections/${connectionId}/calendars`, JSON.stringify(calendar))
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		return observable
	}

	public deleteConnection(connectionId: string) {
		const observable = this.http.delete(`${environment.apiBaseUrl}/v1/connections/${connectionId}/google`).pipe(
			share(),
			catchError((err) => this.handleError(err))
		)

		return observable
	}

	public revokeGoogleConnection(connectionId: string) {
		const observable = this.http
			.post<User>(`${environment.apiBaseUrl}/v1/connections/${connectionId}/google/revoke`, {})
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)
		observable.subscribe((user) => {
			this.userSubject.next(user)
		})

		return observable
	}

	public connectGoogleCalendar(connectionId?: string) {
		let stringWithConnection = ''
		if (connectionId) {
			stringWithConnection = `/${connectionId}`
		}

		const observable = this.http
			.post<{ url: string }>(`${environment.apiBaseUrl}/v1/connections${stringWithConnection}/google`, undefined)
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		return observable
	}

	public patchUserSettings(settings: UserSettings) {
		const observable = this.http
			.patch<User>(`${environment.apiBaseUrl}/v1/user/settings`, JSON.stringify(settings))
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		observable.subscribe((response) => {
			this.userSubject.next(response)
		})

		return observable
	}

	public initiatePayment(product: string) {
		const observable = this.http
			.post<{ url: string }>(`${environment.apiBaseUrl}/v1/user/payment/${product}`, {})
			.pipe(
				share(),
				catchError((err) => this.handleError(err))
			)

		return observable
	}

	public getLinkToPaymentSettings() {
		const observable = this.http.get<{ url: string }>(`${environment.apiBaseUrl}/v1/user/payment`).pipe(
			share(),
			catchError((err) => this.handleError(err))
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
		const apiError = error.error as ApiError

		if (!('error' in apiError)) {
			let userMessage = `We\'ve encountered a problem`

			const toast = new Toast(ToastType.Error, userMessage, true, 0)
			this.modalService.addToast(toast)
			return throwError(userMessage)
		}

		console.error(
			`API returned a bad response: ${apiError.error} with status ${apiError.status} and trackId ${apiError.error.trackId}`
		)

		let userMessage = `We\'ve encountered a problem: ${apiError.error.message}`

		const toast = new Toast(ToastType.Error, userMessage, true, 0)
		toast.trackId = apiError.error.trackId
		this.modalService.addToast(toast)

		// Return an observable with a user-facing error message.
		return throwError(userMessage)
	}
}

interface AuthResponse {
	accessToken: string
	refreshToken: string
	result: User
}

export interface Calendar {
	calendarId: string
	name: string
	isActive: boolean
}

export interface Calendars extends Array<Calendar> {}
