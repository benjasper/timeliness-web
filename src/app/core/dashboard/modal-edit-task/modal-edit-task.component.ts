import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, HostListener, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Duration, DurationUnit } from 'src/app/models/duration'
import { EventModified, Task, TaskModified } from 'src/app/models/task'
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
	isNew = false

	editTask = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		dueAt: new FormControl(new Date().toISOString().slice(0, -1)),
		workload: new FormControl(new Duration(3600000)),
		priority: new FormControl(1),
	})

	constructor(private router: Router, private route: ActivatedRoute, private taskService: TaskService) {
		super()
		this.route.paramMap.subscribe((param) => {
			this.taskId = param.get('id') ?? ''
		})
	}

	@HostListener('document:keydown.escape', ['$event'])
	handleEscape(event: KeyboardEvent): void {
		this.closeModal()
	}

	@HostListener('document:keydown', ['$event'])
	handleKeypresses(event: KeyboardEvent): void {
		console.log(event)
	}

	@HostListener('document:keydown', ['$event'])
	onKeyDown($event: KeyboardEvent): void {
		// Detect platform
		if (navigator.platform.match('Mac')) {
			this.handleMacKeyEvents($event)
		} else {
			this.handleWindowsKeyEvents($event)
		}
	}

	handleMacKeyEvents($event: KeyboardEvent): void {
		// MetaKey documentation
		// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/metaKey
		if ($event.metaKey && $event.key === 's') {
			// Action on Cmd + S
			$event.preventDefault()
			this.save()
		}
	}

	handleWindowsKeyEvents($event: KeyboardEvent): void {
		if ($event.ctrlKey && $event.key === 's') {
			// Action on Ctrl + S
			$event.preventDefault()
			this.save()
		}
	}

	ngOnInit(): void {
		this.modalBackground = true

		if (this.taskId === 'new') {
			this.loaded = true
			this.isNew = true
			return
		}

		this.taskService.getTask(this.taskId).subscribe((task) => {
			this.patchForm(task)
			this.task = task
			this.loaded = true
		})
	}

	private patchForm(task: Task): void {
		this.editTask.setValue({
			name: task.name,
			description: task.description,
			dueAt: task.dueAt.date.start.toDate().toISOString().slice(0, -1),
			workload: task.workloadOverall.toDuration(DurationUnit.Nanoseconds),
			priority: task.priority,
		})
	}

	public close(): boolean {
		this.closeModal()

		return false
	}

	public undo() {
		this.editTask.reset({
			name: this.task.name,
			description: this.task.description,
			dueAt: this.task.dueAt.date.start.toDate().toISOString().slice(0, -1),
			workload: this.task.workloadOverall.toDuration(DurationUnit.Nanoseconds),
			priority: this.task.priority,
		})
	}

	private closeModal(): void {
		this.loaded = false
		this.modalBackground = false
		setTimeout(() => {
			this.router.navigate(['dashboard', { outlets: { modal: null } }])
		}, 200)
	}

	public delete(): void {
		this.taskService.deleteTask(this.taskId).subscribe(() => {
			this.taskService.refreshTasks()
			this.taskService.refreshTasksUnwound()

			this.closeModal()
		})
	}

	public save(): boolean {
		if (!this.editTask.dirty) {
			return false;
		}

		const updatingTask = new TaskModified()

		updatingTask.name =
			this.editTask.get('name')?.dirty || this.isNew ? this.editTask.get('name')?.value : undefined
		updatingTask.description =
			this.editTask.get('description')?.dirty || this.isNew ? this.editTask.get('description')?.value : undefined
		updatingTask.dueAt =
			this.editTask.get('dueAt')?.dirty || this.isNew
				? new EventModified(new Date(this.editTask.get('dueAt')?.value).toISOString())
				: undefined
		updatingTask.priority =
			this.editTask.get('priority')?.dirty || this.isNew ? this.editTask.get('priority')?.value : undefined

		updatingTask.workloadOverall = this.editTask.get('workloadOverall')?.dirty || this.isNew ? 3.6e12 : undefined

		if (this.isNew) {
			this.taskService.newTask(updatingTask).subscribe((task) => {
				this.taskService.refreshTasks()
				this.taskService.refreshTasksUnwound()
				this.editTask.markAsPristine()
				this.task = task
				this.taskId = task.id
				this.isNew = false
			})
		} else {
			this.taskService.patchTask(this.taskId, updatingTask).subscribe((task) => {
				this.taskService.refreshTasks()
				this.taskService.refreshTasksUnwound()
				this.editTask.markAsPristine()
				this.task = task
			})
		}

		return false
	}
}
