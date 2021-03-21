import { Injectable } from '@angular/core'
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http'

import { Observable } from 'rxjs'
import { AuthService } from '../services/auth.service'

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private authService: AuthService) {}
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		let request = req

		if (this.authService.isLoggedIn()) {
			request = req.clone({
				setHeaders: {
					Authorization: `Bearer ${this.authService.getAccessToken()}`,
				},
			})
		}

		return next.handle(request)
	}
}
