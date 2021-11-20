import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}

	form = new FormGroup({
		firstname: new FormControl('', [Validators.required]),
		lastname: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
		password2: new FormControl('', [Validators.required, matchOtherValidator('password')]),
		privacy: new FormControl('', [Validators.requiredTrue]),
	})
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
