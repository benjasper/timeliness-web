import { Component, Input, OnInit } from '@angular/core'
import { Task } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

@Component({
	selector: 'app-deadline',
	templateUrl: './deadline.component.html',
	styleUrls: ['./deadline.component.scss'],
})
export class DeadlineComponent extends TaskComponent implements OnInit {
	constructor(private taskService: TaskService) {
		super()
	}

	@Input() task!: Task
	@Input() loading = false

	ngOnInit(): void {}
}
