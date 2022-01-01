import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { ToastType } from 'src/app/models/toast'
import { TimingPreferences, User } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'
import { ModalService } from 'src/app/services/modal.service'

@Component({
	selector: 'app-timing-preference',
	templateUrl: './timing-preference.component.html',
})
export class TimingPreferenceComponent implements OnInit {
	constructor(private authService: AuthService, private modalService: ModalService) {}

	form = new FormGroup({
		timing: new FormControl(''),
	})

	user?: User

	TIMING_PREFERENCES = TimingPreferences

	ngOnInit(): void {
		this.authService.user.subscribe((user) => {
			if (user) {
				this.user = user
				if (!user.settings.scheduling?.timingPreference) {
					this.form.patchValue({
						timing: TimingPreferences.Early,
					})
				} else {
					this.form.get('timing')?.setValue(user.settings.scheduling?.timingPreference ?? TimingPreferences.Early)
				}
			}
		})
	}

	save() {
		console.log(this.form.value)
		this.authService.patchUserSettings({
			scheduling: { timingPreference: this.form.value.timing ?? TimingPreferences.Early },
		}).subscribe(() => {
			this.modalService.newToast(ToastType.Success, 'Timing preference saved!')
		})
	}
}
