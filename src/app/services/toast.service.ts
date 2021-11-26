import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs'
import { OnboardingStep } from '../models/onboarding-step'
import { Toast, ToastType } from '../models/toast'

@Injectable({
	providedIn: 'root',
})
export class ToastService {
	private currentToast: Subject<Toast> = new Subject()

	public currentToastObservable = this.currentToast.asObservable()

	constructor() {}

	public newToast(
		type: ToastType,
		message: string,
		dismissable = false,
		seconds = 5,
		link?: { title: string; link: string }
	) {
		this.currentToast.next(new Toast(type, message, dismissable, seconds, link))
	}
}
