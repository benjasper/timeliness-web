import { DurationUnit } from '../models/duration'
import { Task } from '../models/task'

export class TaskComponent {
	public getRemainingWorkload(task: Task): string {
		let doneWorkload = 0

		task.workUnits
			.filter((x) => x.isDone)
			.forEach((workunit) => {
				doneWorkload += workunit.workload
			})

		return (task.workloadOverall - doneWorkload).toDuration(DurationUnit.Nanoseconds).toString()
	}

	public getProgress(task: Task): number {
		let doneWorkload = 0

		task.workUnits
			.filter((x) => x.isDone)
			.forEach((workunit) => {
				doneWorkload += workunit.workload
			})

		const percentage = (doneWorkload / task.workloadOverall) * 100

		return percentage
	}
}
