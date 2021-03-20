import { Component, Input, OnInit } from '@angular/core'
import { Task, TaskUnwound } from 'src/app/models/task'
import { DurationUnit, Duration } from 'src/app/models/duration'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'
import { animate, style, transition, trigger } from '@angular/animations'

@Component({
	selector: 'app-work-unit-card',
	templateUrl: './work-unit-card.component.html',
	styleUrls: ['./work-unit-card.component.scss'],
	animations: [
		trigger('appear', [
			transition(':enter', [style({ opacity: 0, transform: 'translateX(50%)'}), animate(200)]),
			transition(':leave', [animate(200, style({ opacity: 0 }))]),
		]),
	]
})
export class WorkUnitCardComponent extends TaskComponent implements OnInit {
	constructor(private taskService: TaskService) {
		super()
	}

	public today = new Date()
	@Input() task!: TaskUnwound

	ngOnInit(): void {
		setInterval(() => {
			this.today = new Date()
		}, 30000)
	}

	public markWorkUnitAsDone(task: Task, workUnitIndex: number, done = true): void {
		this.taskService.markWorkUnitAsDone(task, workUnitIndex, done).subscribe(result => {
			this.taskService.refreshTasksUnwound()
			this.taskService.refreshTasks()
		})
	}
}
