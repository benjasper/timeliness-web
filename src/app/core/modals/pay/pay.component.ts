import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, Route, Router } from '@angular/router'
import { modalFlyInOut } from 'src/app/animations'
import { BillingStatus, User } from 'src/app/models/user'
import { PageComponent } from 'src/app/pages/page'
import { AuthService } from 'src/app/services/auth.service'
import { environment } from 'src/environments/environment'
import { EnvironmentStatus } from 'src/environments/environment-interface'

@Component({
	selector: 'app-pay',
	templateUrl: './pay.component.html',
	animations: [modalFlyInOut],
})
export class PayComponent extends PageComponent implements OnInit {
	constructor(
		private router: Router,
		protected titleService: Title,
		private authService: AuthService,
		private route: ActivatedRoute
	) {
		super(titleService)
	}

	isExitable = false

	isShowing = true
	isMonthly = true
	user?: User
	BILLING_STATUS = BillingStatus
	loading = false

	ngOnInit(): void {
		this.setTitle('Subscribe to Timeliness Pro')

		this.authService.user.subscribe((user) => {
			if (user) {
				this.user = user

				if ((user.billing.status === BillingStatus.Trial && user.billing.endsAt.toDate().getTime() >= new Date().getTime()) || user.billing.status === BillingStatus.Active) {
					this.isExitable = true
				}

				// TODO Check if we have the success query parameter and if so wait until the user has subscription status active

				// Get query parameter success
				this.route.queryParams.subscribe(async (params) => {
					if (params.success && params.success === 'true' && this.loading === false) {
						this.loading = true
						while (this.user?.billing.status !== BillingStatus.Active) {
							await new Promise((resolve) => setTimeout(resolve, 5000))
							await this.authService.forceUserUpdate().toPromise()
						}
						this.loading = false

						this.close()
					}
				})

				if (this.user.billing.status === BillingStatus.Active) {
					this.close()
				}
			}
		})
	}

	initiatePayment() {
		if (this.user?.billing.status === BillingStatus.Cancelled && this.user?.billing.endsAt.toDate().getTime() > new Date().getTime()) {
			this.loading = true
			this.authService.getLinkToPaymentSettings().subscribe(
				(response) => {
					window.location.href = response.url
				},
				() => {
					this.loading = false
				}
			)
			return
		}

		const price =
			environment.environment === EnvironmentStatus.Production
				? this.authService.paymentOptions[this.isMonthly ? 'monthly' : 'yearly'].production
				: this.authService.paymentOptions[this.isMonthly ? 'monthly' : 'yearly'].testing
		this.loading = true
		this.authService.initiatePayment(price).subscribe(
			(response) => {
				window.location.href = response.url
			},
			() => {
				this.loading = false
			}
		)
	}

	async close() {
		this.loading = false
		this.isShowing = false

		setTimeout(() => {
			this.router.navigate(['/dashboard'])
		}, 200)
	}
}
