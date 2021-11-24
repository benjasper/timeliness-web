export class Duration {
	milliseconds = 0

	constructor(milliseconds: number) {
		this.milliseconds = Math.abs(milliseconds)
	}

	public toString(): string {
		return this.buildDurationString(false)
	}

	public toStringWithoutSeconds(): string {
		return this.buildDurationString(true)
	}

	private buildDurationString(noSeconds = false): string {
		let duration = this.milliseconds

		if (duration === 0) {
			return '0h'
		}

		if (duration < 1000) {
			return ''
		}

		duration /= 1000

		if (duration < 60) {
			if (noSeconds) {
				return ''
			}

			return Math.floor(duration) + 's'
		}

		duration /= 60

		if (duration < 60) {
			if (duration % 1 !== 0) {
				return (
					Math.floor(duration) +
					'm' +
					' ' +
					new Duration((duration % 1) * 60000).buildDurationString(noSeconds)
				)
			}

			return duration + 'm'
		}

		duration /= 60

		if (duration < 24) {
			if (duration % 1 !== 0) {
				return (
					Math.floor(duration) +
					'h' +
					' ' +
					new Duration((duration % 1) * 3.6e6).buildDurationString(noSeconds)
				)
			}

			return duration + 'h'
		}

		duration /= 24


		if (duration % 1 !== 0) {
			return (
				Math.floor(duration) +
				'd' +
				' ' +
				new Duration((duration % 1) * 8.64e7).buildDurationString(noSeconds)
			)
		}

		return duration + 'd'
	}

	public toNanoseconds(): number {
		return this.milliseconds * 1e6
	}
}

export enum DurationUnit {
	Milliseconds,
	Nanoseconds,
}
