import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Task } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

@Component({
	selector: 'app-modal-edit-task',
	templateUrl: './modal-edit-task.component.html',
	styleUrls: ['./modal-edit-task.component.scss'],
})
export class ModalEditTaskComponent extends TaskComponent implements OnInit {
	taskId!: string
	task!: Task
	loaded = false
	priority = 0

	constructor(private router: Router, private route: ActivatedRoute, private taskService: TaskService) {
		super()
		this.route.paramMap.subscribe((param) => {
			this.taskId = param.get('id') ?? ''
		})
	}

	ngOnInit(): void {
		
		if (this.taskId === 'new') {
			this.loaded = true
			return
		}

		this.taskService.getTask(this.taskId).subscribe((task) => {
			this.task = task
			this.priority = this.getProgress(task)
			this.loaded = true
		})
	}

	public close(): void {
		this.router.navigate(['dashboard', { outlets: { modal: null } }])
	}
}
