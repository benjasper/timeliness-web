import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { Toast, ToastType } from './models/toast'
import { ToastService } from './services/toast.service'

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	animations: [
		trigger('flyInOut', [
			transition(':enter', [style({ transform: 'translate(-50%, 150%)', opacity: 0 }), animate(200)]),
			transition(':leave', [animate(200), style({ transform: 'translate(-50%, 150%)', opacity: 0 })]),
		]),
	],
})
export class AppComponent implements OnInit {
	title = 'Timeliness'

	// TODO remove
	toast: Toast | undefined

	TOAST_TYPE = ToastType

	constructor(private toastService: ToastService) {}

	ngOnInit() {
		this.toastService.currentToastObservable.subscribe((toast) => {
			if (toast.type === ToastType.Error) {
				console.error(toast.message)
			}

			if (this.toast) {
				this.toast = undefined
				setTimeout(() => {
					this.toast = toast

					setTimeout(() => {
						this.toast = undefined
					}, 5000)
				}, 200)

				return
			}

			this.toast = toast

			setTimeout(() => {
				this.toast = undefined
			}, 5000)
		})
	}
}
