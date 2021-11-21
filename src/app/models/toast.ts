export class Toast {
	type: ToastType
	message: String
	seconds: number
	link?: { title: string; link: string }
	dismissable: boolean

	constructor(
		type: ToastType,
		message: string,
		dismissable = false,
		seconds = 5,
		link?: { title: string; link: string }
	) {
		this.type = type
		this.message = message
		this.seconds = seconds
		this.link = link
		this.dismissable = dismissable
	}
}

export enum ToastType {
	Success,
	Error,
	Warning,
}
