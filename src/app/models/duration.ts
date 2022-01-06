export class Duration {
	milliseconds = 0

	constructor(milliseconds: number) {
		this.milliseconds = Math.abs(milliseconds)
	}

	public toString(): string {
		return this.buildDurationString(false)
	}

	public toStringWithoutSeconds(): string {
		if (this.milliseconds / 1000 < 60) {
			return this.buildDurationString(false)
		}

		return this.buildDurationString(true)
	}

	private buildDurationString(noSeconds = false): string {
		const days = Math.floor(this.milliseconds / (1000 * 60 * 60 * 24))
		const hours = Math.floor((this.milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
		const minutes = Math.floor((this.milliseconds % (1000 * 60 * 60)) / (1000 * 60))
		const seconds = Math.floor((this.milliseconds % (1000 * 60)) / 1000)

		let result = ''

		if (days > 0) {
			result += `${days}d `
		}

		if (hours > 0) {
			result += `${hours}h `
		}

		if (minutes > 0) {
			result += `${minutes}m `
		}

		if (!noSeconds && seconds > 0) {
			result += `${seconds}s`
		}

		return result === '' ? '0h' : result
	}

	public toNanoseconds(): number {
		return this.milliseconds * 1e6
	}
}

export enum DurationUnit {
	Milliseconds,
	Nanoseconds,
}
