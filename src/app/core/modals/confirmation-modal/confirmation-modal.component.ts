import { trigger, transition, style, animate } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
import { ModalResult } from 'src/app/services/modal.service'

export interface ConfirmationModalData {
	title: string
	message: string
}

@Component({
	selector: 'app-confirmation-modal',
	templateUrl: './confirmation-modal.component.html',
	animations: [
		trigger('inOut', [
			transition(':enter', [style({ opacity: 0 }), animate(200)]),
			transition(':leave', [style({ opacity: 0.5 }), animate(200)]),
		]),
		trigger('flyInOut', [
			transition(':enter', [style({ opacity: 0 }), animate(300)]),
			transition(':leave', [animate(300, style({ transform: 'translate(-50%, 150%)', opacity: 0 }))]),
		]),
	],
})
export class ConfirmationModalComponent
	extends SimpleModalComponent<ConfirmationModalData, ModalResult<boolean>>
	implements OnInit, ConfirmationModalData
{
	title!: string
	message!: string

	isOpen = false
	result: ModalResult<boolean> = new ModalResult(false, false)

	ngOnInit(): void {
		this.isOpen = true
	}

	close(): Promise<any> {
		this.isOpen = false
		return super.close()
	}

	apply(result: boolean) {
		this.result = new ModalResult(result, true)
		this.close()
	}
}
