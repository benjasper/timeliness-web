import { Injectable } from '@angular/core'
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http'

import { Observable } from 'rxjs'

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const request = req.clone({
			setHeaders: {
				Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwcm9qZWN0LXRhc2tzIiwic3ViIjoiNjAyMTg5ODMwY2RlNjE2YTk4YzA5Mzc5IiwiZXhwIjoxNjE2MjU5NTg4LCJpYXQiOjE2MTYxNzMxODgsInRrdCI6ImFjY2Vzc190b2tlbiJ9.hG_u2IPYVwq2xodZuCMkJM6SKsbnZfeqwvwDuq585eg`,
			},
		})

		return next.handle(request)
	}
}
