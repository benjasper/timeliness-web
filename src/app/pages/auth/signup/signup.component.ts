import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { ToastType } from 'src/app/models/toast'
import { AuthService } from 'src/app/services/auth.service'
import { ToastService } from 'src/app/services/toast.service'

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {
	loading = false

	constructor(private authService: AuthService, private toastService: ToastService, private router: Router) {}

	ngOnInit(): void {}

	get firstname() {
		return this.form.get('firstname')
	}

	get lastname() {
		return this.form.get('lastname')
	}

	get email() {
		return this.form.get('email')
	}

	get password() {
		return this.form.get('password')
	}

	get password2() {
		return this.form.get('password2')
	}

	get privacy() {
		return this.form.get('privacy')
	}

	form = new FormGroup({
		firstname: new FormControl('', [Validators.required]),
		lastname: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
		password2: new FormControl('', [Validators.required, matchOtherValidator('password')]),
		privacy: new FormControl('', [Validators.requiredTrue]),
	})

	submit() {
		this.form.markAsPristine()
		this.form.clearValidators()
		
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return false
		}
		
		this.loading = true

		this.authService
			.register({
				firstname: this.firstname?.value,
				lastname: this.lastname?.value,
				email: this.email?.value,
				password: this.password?.value,
			})
			.subscribe(
				() => {
					this.loading = false
					this.toastService.newToast(ToastType.Success, 'Account created!')
					this.router.navigate(['/auth/verify'])
				},
				(error) => {
					this.loading = false
					if (error.status === 409) {
						this.email?.setErrors({ unique: true })
					}
				}
			)

		return false
	}
}

function matchOtherValidator(otherControlName: string) {
	let thisControl: FormControl
	let otherControl: FormControl

	return function matchOtherValidate(control: FormControl) {
		if (!control.parent) {
			return null
		}

		// Initializing the validator.
		if (!thisControl) {
			thisControl = control
			otherControl = control.parent.get(otherControlName) as FormControl
			if (!otherControl) {
				throw new Error('matchOtherValidator(): other control is not found in parent group')
			}
			otherControl.valueChanges.subscribe(() => {
				thisControl.updateValueAndValidity()
			})
		}

		if (!otherControl) {
			return null
		}

		if (otherControl.value !== thisControl.value) {
			return {
				matchOther: true,
			}
		}
		return null
	}
}
