import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Duration, DurationUnit } from 'src/app/models/duration';
import { ToastType } from 'src/app/models/toast';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
	selector: 'app-busy-padding',
	templateUrl: './busy-padding.component.html'
})
export class BusyPaddingComponent implements OnInit {

	constructor(private authService: AuthService, private modalService: ModalService) { }

	user: User | undefined

	options = [
		new Duration(0),
		new Duration(1000 * 60 * 5),
		new Duration(1000 * 60 * 10),
		new Duration(1000 * 60 * 15),
		new Duration(1000 * 60 * 30),
		new Duration(1000 * 60 * 60),
	]

	form = new FormGroup({
		spacing: new FormControl(new Duration(1000 * 60 * 15).toNanoseconds()),
	})

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (user) {
				this.user = user
				this.form.get('spacing')?.setValue(user.settings.scheduling?.busyTimeSpacing?.toDuration(DurationUnit.Nanoseconds).toNanoseconds() ?? new Duration(0).toNanoseconds())
			}
		})
	}

	change() {
		const spacing: Duration = (this.form.get('spacing')?.value as number).toDuration(DurationUnit.Nanoseconds)
		if (this.user && this.user.settings.scheduling?.busyTimeSpacing === spacing.toNanoseconds()) {
			return
		}

		this.authService
			.patchUserSettings({ scheduling: { busyTimeSpacing: spacing.toNanoseconds() } })
			.subscribe(
				() => {
					this.modalService.newToast(ToastType.Success, 'Updated distance between events')
				}
			)
	}

}
