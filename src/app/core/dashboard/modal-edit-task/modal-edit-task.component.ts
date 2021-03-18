import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Task } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

@Component({
	selector: 'app-modal-edit-task',
	templateUrl: './modal-edit-task.component.html',
	styleUrls: ['./modal-edit-task.component.scss'],
	animations: [
		trigger('modalBackground', [
			transition(':enter', [style({ opacity: 0 }), animate(100)]),
			transition(':leave', [animate(100, style({ opacity: 0 }))]),
		]),
		trigger('flyInOut', [
			transition(':enter', [style({ transform: 'translate(-50%, -250%)', opacity: 0 }), animate(200)]),
			transition(':leave', [animate(200, style({ transform: 'translate(-50%, 150%)', opacity: 0 }))]),
		]),
	],
})
export class ModalEditTaskComponent extends TaskComponent implements OnInit {
	taskId!: string
	task!: Task
	loaded = false
	modalBackground = false
	priority = 0

	constructor(private router: Router, private route: ActivatedRoute, private taskService: TaskService) {
		super()
		this.route.paramMap.subscribe((param) => {
			this.taskId = param.get('id') ?? ''
		})
	}

	ngOnInit(): void {
		this.modalBackground = true

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
		this.loaded = false
		this.modalBackground = false
		setTimeout(() => {
			this.router.navigate(['dashboard', { outlets: { modal: null } }])
		}, 200)
	}
}
