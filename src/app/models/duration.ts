export class Duration {
    milliseconds = 0

    constructor(milliseconds: number) {
        this.milliseconds = milliseconds;
    }

    public toString(): string {
        let duration = this.milliseconds;

        if (duration < 1000) {
            return this.milliseconds + 'ms';
        }

        duration /= 1000

        if (duration < 60) {
            return duration.toFixed() + 's';
        }

        duration /= 60

        if (duration < 60) {
            if (duration % 1 !== 0) {
                return duration.toFixed() + 'm' + ' ' + new Duration(duration % 1 * 60000).toString();
            }

            return duration + 'm';
        }

        duration /= 60

        if (duration % 1 !== 0) {
            return duration.toFixed() + 'h' + ' ' + new Duration(duration % 1 * 3.6e+6).toString();
        }

        return duration + 'h';
    }
}

export enum DurationUnit {
    Milliseconds,
    Nanoseconds,
  }

// tslint:disable-next-line: only-arrow-functions
Number.prototype.toDuration = function(unit: DurationUnit = DurationUnit.Milliseconds): Duration {
    if (unit === DurationUnit.Nanoseconds) {
        return new Duration(this.valueOf() / 1000000)
    }
    return new Duration(this.valueOf())
}
