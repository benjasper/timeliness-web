import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { modalFlyInOut } from 'src/app/animations'
import { BillingStatus, User } from 'src/app/models/user'
import { PageComponent } from 'src/app/pages/page'
import { AuthService } from 'src/app/services/auth.service'
import { environment } from 'src/environments/environment'
import { EnvironmentStatus } from 'src/environments/environment-interface'

@Component({
	selector: 'app-pay',
	templateUrl: './pay.component.html',
	animations: [
		modalFlyInOut
	],
})
export class PayComponent extends PageComponent implements OnInit {
	constructor(private router: Router, protected titleService: Title, private authService: AuthService) {
		super(titleService)
	}

	isShowing = true
	isMonthly = true
	user?: User
	BILLING_STATUS = BillingStatus

	ngOnInit(): void {
		this.setTitle('Subscribe to Timeliness Pro')

		this.authService.user.subscribe((user) => {
			if (user) {
				this.user = user

				// TODO Check if we have the success query parameter and if so wait until the user has subscription status active
				

				if (this.user.billing.status === BillingStatus.Active) {
					this.close()
				}
			}
		})
	}

	inititatePayment() {
		const price = environment.environment === EnvironmentStatus.Production ? this.authService.paymentOptions[this.isMonthly ? 'monthly' : 'yearly'].production : this.authService.paymentOptions[this.isMonthly ? 'monthly' : 'yearly'].testing
		this.authService.initiatePayment(price).subscribe(response => {
			window.location.href = response.url
		})
	}

	async close() {
		this.isShowing = false

		setTimeout(() => {
			this.router.navigate(['/dashboard'])
		}, 200)
	}
}
