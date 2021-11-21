import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ToastType } from 'src/app/models/toast'
import { ToastService } from 'src/app/services/toast.service'
import { AuthService } from '../../../services/auth.service'

@Component({
	selector: 'app-signin',
	templateUrl: './signin.component.html',
})
export class SigninComponent implements OnInit {
	constructor(
		private authService: AuthService,
		private route: ActivatedRoute,
		private router: Router,
		private toastService: ToastService
	) {}

	signinForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	})

	returnUrl = ''

	loading = false

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.returnUrl = params.returnUrl ?? ''
		})
	}

	get email() {
		return this.signinForm.get('email')
	}

	get password() {
		return this.signinForm.get('password')
	}

	public submit() {
		this.signinForm.markAsPristine()
		this.signinForm.clearValidators()
		
		if (this.signinForm.invalid) {
			this.signinForm.markAllAsTouched()
			return false
		}
		
		this.loading = true

		this.authService
			.authenticate({
				email: this.signinForm.get('email')?.value,
				password: this.signinForm.get('password')?.value,
			})
			.subscribe(
				(response) => {
					let route = 'dashboard'
					if (this.returnUrl !== '') {
						route = this.returnUrl
					}

					this.loading = false
					this.toastService.newToast(ToastType.Success, 'You are now logged in!')

					this.router.navigate([route])
				},
				(error) => {
					if (error.status === 400) {
						this.email?.setErrors({mismatch: true})
						this.password?.setErrors({mismatch: true})
					}
					this.loading = false
				}
			)

		return false
	}
}
