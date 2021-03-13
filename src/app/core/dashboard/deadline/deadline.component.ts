import { Component, Input, OnInit } from '@angular/core'
import { DurationUnit } from 'src/app/models/duration'
import { Task } from 'src/app/models/task'

@Component({
    selector: 'app-deadline',
    templateUrl: './deadline.component.html',
    styleUrls: ['./deadline.component.scss'],
})
export class DeadlineComponent implements OnInit {
    constructor() {}

    @Input() task!: Task

    public getPriorityColor(): string {
        switch (this.task.priority) {
            case 1:
                return 'green'
            case 2:
                return 'yellow'
            case 3:
                return 'red'
            default:
                return 'green'
        }
    }

    public getRemainingWorkload(): string {
        let doneWorkload = 0

        this.task.workUnits.filter(x => x.isDone).forEach((workunit) => {
            doneWorkload += workunit.workload
        })

        return (this.task.workloadOverall - doneWorkload)
            .toDuration(DurationUnit.Nanoseconds)
            .toString()
    }

    public getProgress(): number {
        let doneWorkload = 0

        this.task.workUnits.filter(x => x.isDone).forEach((workunit) => {
            doneWorkload += workunit.workload
        })

        const percentage = (doneWorkload / this.task.workloadOverall) * 100;

        return percentage;
    }

    ngOnInit(): void {}
}
