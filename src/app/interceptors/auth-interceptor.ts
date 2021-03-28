import { Injectable } from '@angular/core'
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http'

import { Observable } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { map, switchMap, tap } from 'rxjs/operators'

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private authService: AuthService) {}
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		console.log(req)
		if (this.authService.isLoggedIn()) {
			console.log(req.url)
			if (this.authService.isAccessTokenExpired() && !req.url.includes('refresh')) {
				return this.authService.refreshAccessToken().pipe(
					switchMap((_) => {
						return next.handle(this.getModifiedRequest(req))
					})
				)
			}
		}

		return next.handle(this.getModifiedRequest(req))
	}

	getModifiedRequest(req: HttpRequest<any>): HttpRequest<any> {
		return req.clone({
			setHeaders: {
				Authorization: `Bearer ${this.authService.getAccessToken()}`,
			},
		})
	}
}
