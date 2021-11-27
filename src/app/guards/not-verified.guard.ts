import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'
import { first, map, switchMap } from 'rxjs/operators'
import { User } from '../models/user'
import { AuthService } from '../services/auth.service'

@Injectable({
	providedIn: 'root',
})
export class NotVerifiedGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return new Promise(async (resolve, reject) => {
			this.authService.user.pipe(first()).subscribe(user => {
				if (user && !user.emailVerified) {
					this.router.navigate(['/auth/verify'])
					resolve(false)
				} else {
					resolve(true)
				}
			})
		})
	}
}
