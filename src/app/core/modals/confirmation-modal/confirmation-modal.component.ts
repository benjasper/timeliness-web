import { trigger, transition, style, animate } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { SimpleModalComponent } from 'ngx-simple-modal'
import { modalBackground, modalFlyInOut } from 'src/app/animations'
import { ModalResult } from 'src/app/services/modal.service'

export interface ConfirmationModalData {
	title: string
	message: string
	confirmationModalOptions?: ConfirmationModalOption[]
}

export interface ConfirmationModalOption {
	key: string
	label: string
}

@Component({
	selector: 'app-confirmation-modal',
	templateUrl: './confirmation-modal.component.html',
	animations: [
		modalBackground,
		modalFlyInOut
	],
})
export class ConfirmationModalComponent
	extends SimpleModalComponent<ConfirmationModalData, ModalResult<{result: boolean, resultKey?: string}>>
	implements OnInit, ConfirmationModalData
{
	title!: string
	message!: string
	confirmationModalOptions?: ConfirmationModalOption[]

	isOpen = false
	result: ModalResult<{result: boolean, resultKey?: string}> = new ModalResult({result: false}, false)

	ngOnInit(): void {
		this.isOpen = true
	}

	close(): Promise<any> {
		this.isOpen = false
		return super.close()
	}

	apply(result: boolean, resultKey?: string) {
		this.result = new ModalResult({result: result, resultKey}, true)
		this.close()
	}
}
