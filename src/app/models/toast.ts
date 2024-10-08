export class Toast {
	constructor(
		public type: ToastType,
		public message: string,
		public dismissible = false,
		public seconds = 5,
		public link?: { title: string; link: string },
		public loading?: Promise<void|any>,
		public loadingText?: string,
		public trackId?: string
	) {}
}

export enum ToastType {
	Success,
	Error,
	Warning,
}
