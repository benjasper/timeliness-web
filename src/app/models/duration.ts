export class Duration {
	milliseconds = 0

	constructor(milliseconds: number) {
		this.milliseconds = milliseconds
	}

	public toString(): string {
		let duration = this.milliseconds

		if (duration === 0) {
			return '0h'
		}

		if (duration < 1000) {
			return this.milliseconds + 'ms'
		}

		duration /= 1000

		if (duration < 60) {
			return Math.floor(duration) + 's'
		}

		duration /= 60

		if (duration < 60) {
			if (duration % 1 !== 0) {
				return Math.floor(duration) + 'm' + ' ' + new Duration((duration % 1) * 60000).toString()
			}

			return duration + 'm'
		}

		duration /= 60

		if (duration % 1 !== 0) {
			return Math.floor(duration) + 'h' + ' ' + new Duration((duration % 1) * 3.6e6).toString()
		}

		return duration + 'h'
	}

	public toNanoseconds(): number {
		return this.milliseconds * 1e6
	}
}

export enum DurationUnit {
	Milliseconds,
	Nanoseconds,
}
