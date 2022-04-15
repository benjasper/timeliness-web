import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { sliderRoutes } from '../animations'
import { Duration } from '../models/duration'
import { BillingStatus, User } from '../models/user'
import { AuthService } from '../services/auth.service'

@Component({
	selector: 'app-core',
	templateUrl: './core.component.html',
	animations: [
		sliderRoutes
	]
})
export class CoreComponent implements OnInit {
	constructor(private authService: AuthService) {}
	public user?: User

	BILLING_STATUS = BillingStatus
	trialExpired = false

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (user) {
				this.user = user

				if (user.billing.status === BillingStatus.Trial && user.billing.endsAt.toDate().getTime() < new Date().getTime()) {
					this.trialExpired = true
				}
			}
		})
	}

	prepareRoute(outlet: RouterOutlet) {
		return outlet?.activatedRouteData?.['animation']
	}

	public logout(): void {
		this.authService.logout()
	}

	getDaysUntilTrialExpiration(): number {
		const now = new Date()
		const trialExpiration = this.user?.billing.endsAt.toDate()
		if (!trialExpiration) {
			return 0
		}
		return Math.round((trialExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
	}

	getDurationUntilTrialExpiration(): Duration {
		const now = new Date()
		const trialExpiration = this.user?.billing.endsAt.toDate()
		if (!trialExpiration) {
			return new Duration(0)
		}
		return (trialExpiration.getTime() - now.getTime()).toDuration()
	}
}
