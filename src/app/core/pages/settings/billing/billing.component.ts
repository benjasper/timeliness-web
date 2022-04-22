import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { BillingStatus, User } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { environment } from 'src/environments/environment'
import { EnvironmentStatus } from 'src/environments/environment-interface'

@Component({
	selector: 'app-billing',
	templateUrl: './billing.component.html',
})
export class BillingComponent implements OnInit {
	constructor(private authService: AuthService) {}

	BILLING_STATUS = BillingStatus
	public user?: User

	ngOnInit(): void {
		this.authService.user.subscribe((user) => {
			if (user) {
				this.user = user
			}
		})
	}

	async initiatePayment(option: 'monthly' | 'yearly') {
		const price = environment.environment === EnvironmentStatus.Production ? this.authService.paymentOptions[option].production : this.authService.paymentOptions[option].testing
		const response = await this.authService.initiatePayment(price).toPromise()
		window.location.href = response.url
	}

	async gotoPaymentPortal() {
		const response = await this.authService.getLinkToPaymentSettings().toPromise()
		window.location.href = response.url
	}
}
