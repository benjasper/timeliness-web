import { DurationUnit } from '../models/duration'
import { Task } from '../models/task'
import { TaskService } from '../services/task.service'

export class TaskComponent {
	public constructor() { }

	getRemainingWorkload = TaskComponent.getRemainingWorkload
	getFinishedWorkload = TaskComponent.getFinishedWorkload
	getProgress = TaskComponent.getProgress
	getColorClass = TaskComponent.getColorClass

	public static getRemainingWorkload(task: Task): string {
		let doneWorkload = 0

		task.workUnits
			.filter((x) => x.isDone)
			.forEach((workunit) => {
				doneWorkload += workunit.workload
			})

		return (task.workloadOverall - doneWorkload).toDuration(DurationUnit.Nanoseconds).toString()
	}

	public static getFinishedWorkload(task: Task): string {
		let doneWorkload = 0

		task.workUnits
			.filter((x) => x.isDone)
			.forEach((workunit) => {
				doneWorkload += workunit.workload
			})

		return (doneWorkload).toDuration(DurationUnit.Nanoseconds).toString()
	}

	public static getProgress(task: Task): string {
		let doneWorkload = 0

		if (!task || !task.workUnits || task.workUnits.length === 0) {
			return '0'
		}

		task.workUnits
			.filter((x) => x.isDone)
			.forEach((workunit) => {
				doneWorkload += workunit.workload
			})

		const percentage = (doneWorkload / task.workloadOverall) * 100

		return percentage.toFixed(0)
	}

	public static getColorClass(color: string, kind: string): string {
		if (color === '') {
			color = 'no-color'
		}
		return color + '-' + kind
	}


}
