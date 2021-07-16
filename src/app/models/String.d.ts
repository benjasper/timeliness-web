import { Duration, DurationUnit } from './duration'

declare global {
	interface String {
		toDate: () => Date
	}
}
