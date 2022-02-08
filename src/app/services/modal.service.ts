import { Injectable, Type } from '@angular/core'
import { SimpleModalComponent, SimpleModalOptions, SimpleModalService } from 'ngx-simple-modal'
import { asyncScheduler, Observable, pipe, queueScheduler, Subscription } from 'rxjs'
import { publishReplay, share, take } from 'rxjs/operators'
import { ToastComponent } from '../core/modals/toast/toast.component'
import { Toast, ToastType } from '../models/toast'

export interface ModalEntry {
	id: string
}

export class ModalResult<T> {
	constructor(public result: T, public hasValue: boolean = false) {}
}

@Injectable({
	providedIn: 'root',
})
export class ModalService extends SimpleModalService {
	modalEntries: ModalEntry[] = []
	toastQueue: Toast[] = []
	lastToastSubscription?: Subscription

	addModal<T, ModalResult>(
		component: Type<SimpleModalComponent<T, ModalResult>>,
		data?: T,
		options?: Partial<SimpleModalOptions>
	): Observable<ModalResult> {
		const id = this.generateID()

		this.modalEntries.push({ id })
		let observable = super.addModal(component, data, options)
		observable = observable.pipe(share())

		observable.subscribe(() => {
			this.modalEntries.splice(
				this.modalEntries.findIndex((x) => x.id === id),
				1
			)
		})

		return observable
	}

	public newToast(
		type: ToastType,
		message: string,
		dismissible = false,
		seconds = 5,
		link?: { title: string; link: string },
		loading?: Promise<void | any>,
		loadingText?: string
	) {
		const toast = new Toast(type, message, dismissible, seconds, link, loading, loadingText)
		this.toastQueue.push(toast)
		this.runNextToast()
	}

	public addToast(toast: Toast) {
		this.toastQueue.push(toast)
		this.runNextToast()
	}

	public runNextToast() {
		const toast = this.toastQueue.shift()

		if (!toast) {
			return
		}
		
		if (this.lastToastSubscription) {
			this.lastToastSubscription.unsubscribe()
		}
		
		let observable = super.addModal(
			ToastComponent,
			{ toast },
			{
				closeOnEscape: toast.dismissible,
				closeOnClickOutside: false,
			}
			)
			
			
		observable = observable.pipe(share())
		const subscription = observable.subscribe()
		this.lastToastSubscription = subscription

		if (toast.loading) {
			toast.loading.then(() => {
				if (toast.seconds > 0) {
					setTimeout(() => {
						subscription.unsubscribe()
					}, toast.seconds * 1000)
				}
			}, () => {
				subscription.unsubscribe()
			})

			return
		}

		if (toast.seconds > 0) {
			setTimeout(() => {
				subscription.unsubscribe()
			}, toast.seconds * 1000)
		}
	}

	hasOpenModals(): boolean {
		return this.modalEntries.length > 0
	}

	private generateID(): string {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	}
}
