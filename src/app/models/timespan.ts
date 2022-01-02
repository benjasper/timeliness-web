import { Duration } from "./duration";

export interface Timespan {
	start: string
	end: string
}

export class Timespan {
	static timespanToDuration(timespan: Timespan) {
		return new Duration(timespan.end.toDate().getTime() - timespan.start.toDate().getTime())
	}
}

export interface TimespanWithDate {
	start: Date
	end: Date
}