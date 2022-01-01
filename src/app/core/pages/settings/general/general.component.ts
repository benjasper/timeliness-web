import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Duration } from 'src/app/models/duration'
import { User } from 'src/app/models/user'
import { AuthService } from 'src/app/services/auth.service'

@Component({
	selector: 'app-general',
	templateUrl: './general.component.html',
	styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {
	user?: User

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.authService.user.subscribe((user) => {
			if (!user) {
				return
			}

			this.user = user
		})
	}

	logout() {
		this.authService.logout()
	}
}
