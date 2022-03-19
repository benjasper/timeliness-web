import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Duration, DurationUnit } from 'src/app/models/duration';
import { ToastType } from 'src/app/models/toast';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
	selector: 'app-min-work-unit-duration',
	templateUrl: './min-work-unit-duration.component.html'
})
export class MinWorkUnitDurationComponent implements OnInit {

	constructor(private authService: AuthService, private modalService: ModalService) { 
	}

	user: User | undefined

	options: Duration[] = []

	form = new FormGroup({
		minDuration: new FormControl(new Duration(1000 * 60 * 60).toNanoseconds()),
	})

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (user) {
				this.user = user
				this.generateDurations()
				this.form.get('minDuration')?.setValue(user.settings.scheduling?.minWorkUnitDuration?.toDuration(DurationUnit.Nanoseconds).toNanoseconds() ?? new Duration(1000 * 60 * 60 * 4).toNanoseconds())
			}
		})
	}

	generateDurations() {
		this.options = [
			new Duration(1000 * 60 * 15),
			new Duration(1000 * 60 * 30),
			new Duration(1000 * 60 * 45),
		]

		for (let milliseconds = 1000 * 60 * 60; milliseconds <= 1000 * 60 * 60 * 8; milliseconds+=30 * 60 * 1000) {
			if (milliseconds > (this.user?.settings.scheduling?.maxWorkUnitDuration?.toDuration(DurationUnit.Nanoseconds).milliseconds ?? 0)) {
				return
			}

			this.options.push(new Duration(milliseconds))
		}
	}

	change() {
		const minDuration: Duration = (this.form.get('minDuration')?.value as number).toDuration(DurationUnit.Nanoseconds)
		if (this.user && this.user.settings.scheduling?.minWorkUnitDuration === minDuration.toNanoseconds()) {
			return
		}

		this.authService
			.patchUserSettings({ scheduling: { minWorkUnitDuration: minDuration.toNanoseconds() } })
			.subscribe(
				() => {
					this.modalService.newToast(ToastType.Success, 'Updated minimum work unit duration')
				}
			)
	}

}
