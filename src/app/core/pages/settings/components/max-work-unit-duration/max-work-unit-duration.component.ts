import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Duration, DurationUnit } from 'src/app/models/duration';
import { ToastType } from 'src/app/models/toast';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
	selector: 'app-max-work-unit-duration',
	templateUrl: './max-work-unit-duration.component.html'
})
export class MaxWorkUnitDurationComponent implements OnInit {

	constructor(private authService: AuthService, private modalService: ModalService) { 
		for (let index = 1; index <= 8; index++) {
			this.options.push(new Duration(1000 * 60 * 60 * index))
			
		}
	}

	user: User | undefined

	options: Duration[] = []

	form = new FormGroup({
		maxDuration: new FormControl(new Duration(1000 * 60 * 60).toNanoseconds()),
	})

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (user) {
				this.user = user
				this.form.get('maxDuration')?.setValue(user.settings.scheduling?.maxWorkUnitDuration?.toDuration(DurationUnit.Nanoseconds).toNanoseconds() ?? new Duration(1000 * 60 * 60 * 4).toNanoseconds())
			}
		})
	}

	change() {
		const maxDuration: Duration = (this.form.get('maxDuration')?.value as number).toDuration(DurationUnit.Nanoseconds)
		if (this.user && this.user.settings.scheduling?.maxWorkUnitDuration === maxDuration.toNanoseconds()) {
			return
		}

		this.authService
			.patchUserSettings({ scheduling: { maxWorkUnitDuration: maxDuration.toNanoseconds() } })
			.subscribe(
				() => {
					this.modalService.newToast(ToastType.Success, 'Updated maximum work unit duration')
				}
			)
	}

}
