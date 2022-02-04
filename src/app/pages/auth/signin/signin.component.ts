import { DOCUMENT } from '@angular/common'
import { Component, Inject, NgZone, OnInit, Renderer2 } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { ToastType } from 'src/app/models/toast'
import { ModalService } from 'src/app/services/modal.service'
import { environment } from 'src/environments/environment'
import { AuthService } from '../../../services/auth.service'
import { PageComponent } from '../../page'

@Component({
	selector: 'app-signin',
	templateUrl: './signin.component.html',
})
export class SigninComponent extends PageComponent implements OnInit {
	constructor(
		private authService: AuthService,
		private route: ActivatedRoute,
		private router: Router,
		private modalService: ModalService,
		protected titleService: Title,
		private renderer2: Renderer2,
		@Inject(DOCUMENT) private _document: any,
		private zone: NgZone
	) {
		super(titleService)

		const _global = (window /* browser */ || global) /* node */ as any

		_global.signInWithGoogleToken = (response: { credential: string }) => {
			this.zone.run(() => {
				this.loading = true

				this.authService.authenticateWithGoogleToken(response.credential).subscribe(
					() => {
						this.router.navigate(['/'])
						this.modalService.newToast(ToastType.Success, 'You are now logged in!')

						this.loading = false
					},
					() => {
						this.loading = false
					}
				)
			})
		}
	}

	signinForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	})

	returnUrl = ''

	loading = false

	ngOnInit(): void {
		this.setTitle('Sign in')

		this.route.queryParams.subscribe((params) => {
			this.returnUrl = params.returnUrl ?? ''
		})

		const s = this.renderer2.createElement('script')
		s.type = 'text/javascript'
		s.src = 'https://accounts.google.com/gsi/client'
		s.text = ``
		this.renderer2.appendChild(this._document.body, s)
	}

	get email() {
		return this.signinForm.get('email')
	}

	get password() {
		return this.signinForm.get('password')
	}
}
