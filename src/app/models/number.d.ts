import { Duration, DurationUnit } from "./duration";

declare global {
    interface Number {
        toDuration: (unit: DurationUnit) => Duration
    }
}

