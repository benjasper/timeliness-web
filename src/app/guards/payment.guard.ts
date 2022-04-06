import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { BillingStatus } from '../models/user'
import { AuthService } from '../services/auth.service'

@Injectable({
	providedIn: 'root',
})
export class PaymentGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return new Promise(async (resolve, reject) => {
			this.authService.user.pipe(take(2)).subscribe((user) => {
				if (
					user &&
					user.billing.endsAt.toDate().getTime() < Date.now() &&
					user.billing.status !== BillingStatus.Active &&
					!state.url.toString().includes('/pay')
				) {
					this.router.navigate(['/dashboard/pay'])
					resolve(false)
				} else {
					resolve(true)
				}
			})
		})
	}
}
