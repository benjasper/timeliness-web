import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { OnboardingStep } from 'src/app/models/onboarding-step'
import { CalendarConnectionStatus } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { PageComponent } from '../page'

@Component({
	selector: 'app-onboarding',
	templateUrl: './onboarding.component.html',
})
export class OnboardingComponent extends PageComponent implements OnInit {
	constructor(private authService: AuthService, private router: Router, protected titleService: Title) {
		super(titleService)
	}

	steps: OnboardingStep[] = [
		{
			identifier: 'calendar',
			isDone: false,
		},
		{
			identifier: 'timezone',
			isDone: true,
		},
		{
			identifier: 'timeslots',
			isDone: true,
		},
		{
			identifier: 'spacing',
			isDone: true,
		},
		{
			identifier: 'timing',
			isDone: true,
		},
	]

	selectedStep = 0

	ngOnInit(): void {
		this.setTitle('Onboarding')
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
			this.router.navigate(['/dashboard/tutorial'])
		})
	}
}
