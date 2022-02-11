import { DOCUMENT } from '@angular/common'
import {
	AfterViewInit,
	Component,
	ElementRef,
	HostListener,
	Inject,
	NgZone,
	OnInit,
	Renderer2,
	ViewChild,
} from '@angular/core'
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
	styles: ['iframe { position: absolute !important; top: 50%; left: 50%; transform: translate(-50%, -50%); }'],
})
export class SigninComponent extends PageComponent implements OnInit, AfterViewInit {
	constructor(
		private authService: AuthService,
		private route: ActivatedRoute,
		private router: Router,
		private modalService: ModalService,
		protected titleService: Title,
		protected ZONE: NgZone
	) {
		super(titleService)
	}

	signinForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', [Validators.required]),
	})

	returnUrl = ''

	loading = false

	@ViewChild('buttonContainer') buttonContainerElement!: ElementRef

	ngOnInit(): void {
		this.setTitle('Sign in')

		this.route.queryParams.subscribe((params) => {
			this.returnUrl = params.returnUrl ?? ''
		})

		const _global = (window /* browser */ || global) /* node */ as any
		_global.google.accounts.id.initialize({
			client_id: '570716917094-tq9jjv09rtgdgqe60rd9hvnvb143cf3p.apps.googleusercontent.com',
			callback: (response: { credential: string }) => {
				this.ZONE.run(() => {
					this.signInWithGoogleToken(response)
				})
			},
		})
	}

	ngAfterViewInit(): void {
		const _global = (window /* browser */ || global) /* node */ as any
		_global.google.accounts.id.renderButton(this.buttonContainerElement.nativeElement, {
			shape: 'circle',
			text: 'signin_with',
		})
	}

	@HostListener('window:load')
	onLoad() {}

	signInWithGoogleToken = (response: { credential: string }) => {
		this.loading = true

		this.authService.authenticateWithGoogleToken(response.credential).subscribe(
			() => {
				this.modalService.newToast(ToastType.Success, 'You are now logged in!')

				this.loading = false
				this.router.navigate(['/'])
			},
			() => {
				this.loading = false
			}
		)
	}

	get email() {
		return this.signinForm.get('email')
	}

	get password() {
		return this.signinForm.get('password')
	}
}
