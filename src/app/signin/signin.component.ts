import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../services/auth.service'

@Component({
	selector: 'app-signin',
	templateUrl: './signin.component.html',
	styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
	constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

	signinForm = new FormGroup({
		email: new FormControl('', [Validators.required]),
		password: new FormControl('', [Validators.required]),
	})

	returnUrl = ''
	invalidCredentials = false
	success = false

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.returnUrl = params.returnUrl
		})
	}

	public submit() {
		this.invalidCredentials = false

		this.authService
			.authenticate({
				email: this.signinForm.get('email')?.value,
				password: this.signinForm.get('password')?.value,
			})
			.subscribe(
				(response) => {
					let route = '/dashboard'
					if (this.returnUrl !== '') {
						route = this.returnUrl
					}

					this.success = true

					setTimeout(() => {
						this.router.navigate([route])
					}, 500)
				},
				(error) => {
					this.invalidCredentials = true
				}
			)
	}
}
