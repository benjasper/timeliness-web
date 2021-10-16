import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  public static checkIfYearNeedsToBeShown(dates: Date[], today: Date): Map<number, number[]> {
		const map = new Map<number, number[]>()

		dates.forEach(date => {
			if (map.has(date.getMonth())) {
				const years = map.get(date.getMonth()) ?? []
				if (years?.includes(date.getFullYear())) {
					return;
				}
				map.set(date.getMonth(), [...years, date.getFullYear()])
				return
			}

			const val = [date.getFullYear()]
			if (date.getFullYear() != today.getFullYear()) {
				val.push(today.getFullYear())
			}
			map.set(date.getMonth(), val)
		})

		return map
	}
}
