import { Injectable, Type } from '@angular/core'
import { SimpleModalComponent, SimpleModalOptions, SimpleModalService } from 'ngx-simple-modal'
import { asyncScheduler, Observable, pipe, queueScheduler } from 'rxjs'
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
	toastBeingShown: Toast | undefined

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
		dismissable = false,
		seconds = 5,
		link?: { title: string; link: string },
		loading?: Promise<void|any>,
		loadingText?: string
	) {
		const toast = new Toast(type, message, dismissable, seconds, link, loading, loadingText)
		this.toastQueue.push(toast)
		this.runNextToast()
	}

	public addToast(
		toast: Toast
	) {
		this.toastQueue.push(toast)
		this.runNextToast()
	}

	public runNextToast() {
		if (this.toastBeingShown) {
			return
		}

		const toast = this.toastQueue.shift()
		this.toastBeingShown = toast

		if (!toast) {
			return
		}

		let observable = super.addModal(ToastComponent, { toast }, {
			closeOnEscape: false,
			closeOnClickOutside: false,
		})

		observable = observable.pipe(share())

		if (toast.loading) {
			toast.loading.then(() => {
				const timeout = setTimeout(() => {
					subscription.unsubscribe()
					this.finishToast(toast)
				}, toast.seconds * 1000)

				const subscription = observable.subscribe(() => {
					this.finishToast(toast)
					clearTimeout(timeout)
				})
			})

			return
		}

		const timeout = setTimeout(() => {
			subscription.unsubscribe()
			this.finishToast(toast)
		}, toast.seconds * 1000)

		const subscription = observable.subscribe(() => {
			this.finishToast(toast)
			clearTimeout(timeout)
		})
	}

	private finishToast(toast: Toast) {
		this.toastBeingShown = undefined
		this.runNextToast()
	}

	hasOpenModals(): boolean {
		return this.modalEntries.length > 0
	}

	private generateID(): string {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	}
}
