import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { OnboardingStep } from 'src/app/models/onboarding-step'
import { CalendarConnectionStatus } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'

@Component({
	selector: 'app-onboarding',
	templateUrl: './onboarding.component.html',
})
export class OnboardingComponent implements OnInit {
	constructor(private authService: AuthService, private router: Router) {}

	steps: OnboardingStep[] = [
		{
			identifier: 'calendar',
			isDone: false,
			evaluate: async () => {
				const user = await this.authService.user.toPromise()

				return user?.googleCalendarConnection.status === CalendarConnectionStatus.Active
			},
		},
		{
			identifier: 'timezone',
			isDone: true,
			evaluate: async () => {
				const user = await this.authService.user.toPromise()

				return true
			},
		},
		{
			identifier: 'timeslots',
			isDone: true,
			evaluate: async () => {
				const user = await this.authService.user.toPromise()

				return true
			},
		},
	]

	selectedStep = 0

	ngOnInit(): void {
	}

	async evaluateOnboardingState() {
		const results = await Promise.all(this.steps.map((step) => step.evaluate()))
	}

	updateValidStatus(identifier: string, validStatus: boolean) {
		const step = this.steps.find((x) => x.identifier === identifier)
		if (step) {
			step.isDone = validStatus
		}
	}

	next() {
		if (this.selectedStep < this.steps.length - 1) {
			this.selectedStep++
		}
	}

	back() {
		if (this.selectedStep > 0) {
			this.selectedStep--
		}
	}

	finish() {
		this.authService.patchUserSettings({ onboardingCompleted: true }).subscribe(() => {
			this.router.navigate(['/'])
		})
	}
}
