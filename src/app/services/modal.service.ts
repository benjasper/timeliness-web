import { Injectable, Type } from '@angular/core'
import { SimpleModalComponent, SimpleModalOptions, SimpleModalService } from 'ngx-simple-modal'
import { Observable, pipe } from 'rxjs'
import { publishReplay, share, take } from 'rxjs/operators'

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

	addModal<T, ModalResult>(
		component: Type<SimpleModalComponent<T, ModalResult>>,
		data?: T,
		options?: Partial<SimpleModalOptions>
	): Observable<ModalResult> {
		const id = this.generateID()
		this.modalEntries.push({ id })
		let observable = super.addModal(component, data, options)
		observable = observable.pipe(share())
		
		observable.subscribe((result) => {
			this.modalEntries.splice(this.modalEntries.findIndex(x => x.id === id), 1)
		})

		return observable
	}

	hasOpenModals(): boolean {
		return this.modalEntries.length > 0
	}

	private generateID(): string {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	}
}
