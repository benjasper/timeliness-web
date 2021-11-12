export class Toast {
	type: ToastType
	message: String

	constructor(type: ToastType, message: string) {
		this.type = type
		this.message = message
	}
}

export enum ToastType {
	Success,
	Error,
	Warning
}