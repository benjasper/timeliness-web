import { Component, Input, OnInit } from '@angular/core'
import { Task, TaskUnwound } from 'src/app/models/task'
import { DurationUnit, Duration } from 'src/app/models/duration'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

@Component({
	selector: 'app-work-unit-card',
	templateUrl: './work-unit-card.component.html',
	styleUrls: ['./work-unit-card.component.scss'],
})
export class WorkUnitCardComponent extends TaskComponent implements OnInit {
	constructor(private taskService: TaskService) {
		super()
	}

	public today = new Date()
	@Input() task!: TaskUnwound

	ngOnInit(): void {}
}
