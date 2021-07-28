import { DurationUnit } from '../models/duration'
import { Task } from '../models/task'
import { TaskService } from '../services/task.service'

export class TaskComponent {
	public constructor() {}

	public getRemainingWorkload(task: Task): string {
		let doneWorkload = 0

		task.workUnits
			.filter((x) => x.isDone)
			.forEach((workunit) => {
				doneWorkload += workunit.workload
			})

		return (task.workloadOverall - doneWorkload).toDuration(DurationUnit.Nanoseconds).toString()
	}

	public getProgress(task: Task): string {
		let doneWorkload = 0

		task.workUnits
			.filter((x) => x.isDone)
			.forEach((workunit) => {
				doneWorkload += workunit.workload
			})

		const percentage = (doneWorkload / task.workloadOverall) * 100

		return percentage.toFixed(0)
	}

	getColorClass(color: string, kind: string): string {
		if (color === '') {
			color = 'no-color'
		}
		return color + '-' + kind
	}

	
}
