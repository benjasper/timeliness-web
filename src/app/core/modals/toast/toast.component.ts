import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
import { Toast, ToastType } from 'src/app/models/toast'

export interface ToastComponentData {
	toast: Toast
}

@Component({
	selector: 'app-toast',
	templateUrl: './toast.component.html',
	animations: [
		trigger('flyInOut', [
			transition(':enter', [style({ transform: 'translate(-50%, 150%)', opacity: 0 }), animate(300)]),
			transition(':leave', [animate(300), style({ transform: 'translate(-50%, 150%)', opacity: 0 })]),
		]),
	],
})
export class ToastComponent
	extends SimpleModalComponent<ToastComponentData, undefined>
	implements OnInit, ToastComponentData
{
	toast!: Toast
	TOAST_TYPE = ToastType

	isOpen = false
	isLoading = false

	ngOnInit(): void {
		this.isOpen = true

		if (this.toast.loading) {
			this.isLoading = true

			this.toast.loading.then(
				() => {
					this.isLoading = false
				},
				() => {
					this.close()
				}
			)
		}
	}

	close(): Promise<any> {
		this.isOpen = false
		return super.close()
	}

	dismiss() {
		this.close()
	}
}
