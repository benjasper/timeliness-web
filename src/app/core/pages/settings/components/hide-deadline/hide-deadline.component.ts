import { Component, OnInit } from '@angular/core'
import { ControlValueAccessor } from '@angular/forms'
import { Duration, DurationUnit } from 'src/app/models/duration'
import { ToastType } from 'src/app/models/toast'
import { AuthService } from 'src/app/services/auth.service'
import { ModalService } from 'src/app/services/modal.service'

@Component({
	selector: 'app-hide-deadline',
	templateUrl: './hide-deadline.component.html',
})
export class HideDeadlineComponent implements OnInit {
	constructor(private modalService: ModalService, private authService: AuthService) {}

	hideWhenToggled = false
	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (!user) {
				return
			}

			this.hideWhenToggled = user.settings.scheduling?.hideDeadlineWhenDone ?? false
		})
	}

	onChange(val: boolean): void {
		this.authService
			.patchUserSettings({ scheduling: { hideDeadlineWhenDone: val} })
			.subscribe(
				() => {
					this.modalService.newToast(ToastType.Success, 'Updated settings')
				}
			)
	}
}
