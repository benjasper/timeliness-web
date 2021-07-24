import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject } from 'rxjs'
import { switchMap, takeUntil } from 'rxjs/operators'
import { Duration, DurationUnit } from 'src/app/models/duration'
import { EventModified, Task, TaskModified } from 'src/app/models/task'
import { Tag } from 'src/app/models/tag'
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
export class ModalEditTaskComponent extends TaskComponent implements OnInit, OnDestroy {
	taskId!: string
	task!: Task
	loaded = false
	modalBackground = false
	isNew = false

	emptyTag: Tag = {
		id: '',
		value: '',
		lastModifiedAt: '',
		color: '',
		createdAt: '',
	}

	public tags: Tag[] = []

	public today = new Date()
	public durations: Duration[] = []

	private ngUnsubscribe = new Subject()

	editTask = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		dueAt: new FormControl(new Date().toISOString().slice(0, -1)),
		workload: new FormControl(new Duration(3600000).milliseconds),
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
		this.generateDurations()

		if (this.taskId === 'new') {
			this.loaded = true
			this.isNew = true
			return
		}

		this.taskService.getTask(this.taskId).subscribe((task) => {
			this.patchForm(task)
			this.task = task
			this.loaded = true

			this.taskService.tasksObservalble.pipe(takeUntil(this.ngUnsubscribe)).subscribe((tasks) => {
				if (!tasks) {
					return
				}

				tasks.forEach((x) => {
					if (x.id === this.task.id) {
						this.patchForm(x)
						this.task = x
						this.loaded = true
					}
				})
			})
		})

		this.taskService.tagsObservable.subscribe((newTags) => {
			if (!this.task) {
				return
			}

			this.tags = []

			this.task.tags.forEach((id) => {
				const foundTag = newTags.find((x) => x.id === id)
				if (foundTag) {
					this.tags.push(foundTag)
				}
			})
		})

		this.taskService.now.pipe(takeUntil(this.ngUnsubscribe)).subscribe((date) => {
			this.today = date
		})
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next()
		this.ngUnsubscribe.complete()
	}

	public getStartsAtWorkUnit(): number {
		if (!this.task) {
			return 0
		}

		const index = this.task.workUnits.findIndex((x) => !x.isDone)

		return index === -1 ? 0 : index
	}

	public generateDurations(task?: Task): void {
		this.durations = []

		const hoursMax = 16
		const quarterHoursMax = 0.75

		let doneWorkUnitsDuration = 0

		if (task) {
			const doneWorkUnits = task.workUnits.filter((x) => x.isDone)

			for (const doneWorkUnit of doneWorkUnits) {
				doneWorkUnitsDuration += doneWorkUnit.workload
			}

			doneWorkUnitsDuration /= 1e6
		}

		for (let i = 0; i <= hoursMax; i++) {
			if (i > 0 && (doneWorkUnitsDuration === 0 || i * 3.6e6 >= doneWorkUnitsDuration)) {
				this.durations.push(new Duration(i * 3.6e6))
			}

			if (i === hoursMax) {
				continue
			}

			for (let j = 0.25; j <= quarterHoursMax; j += 0.25) {
				const duration = (i + j) * 3.6e6

				if (doneWorkUnitsDuration !== 0 && duration < doneWorkUnitsDuration) {
					continue
				}

				this.durations.push(new Duration(duration))
			}
		}
	}

	public markWorkUnitAsDone(task: Task, workUnitIndex: number, done = true): void {
		this.taskService.markWorkUnitAsDone(task, workUnitIndex, done).subscribe((result) => {
			this.patchForm(result)
			this.task = result
			this.loaded = true
		})
	}

	public rescheduleWorkUnit(task: Task, workUnitIndex: number): void {
		this.taskService.rescheduleWorkUnit(task, workUnitIndex).subscribe((newTask) => {
			this.patchForm(newTask)
			this.task = newTask
			this.loaded = true
		})
	}

	private patchForm(task: Task): void {
		this.tags = []
		task.tags.forEach((id) => {
			const tag = this.taskService.getTag(id)
			if (tag) {
				this.tags.push(tag)
			}
		})

		this.editTask.setValue({
			name: task.name,
			description: task.description,
			dueAt: task.dueAt.date.start.toDate().toISOString().slice(0, -1),
			workload: task.workloadOverall.toDuration(DurationUnit.Nanoseconds).milliseconds,
			priority: task.priority,
		})
		this.generateDurations(task)
	}

	public changeTag(tag: Tag, newValue: string) {
		if (tag.id === '') {
			const newTag: Tag = {
				id: '123',
				value: newValue,
				lastModifiedAt: '',
				color: '',
				createdAt: '',
			}

			this.tags.push(newTag)
		}
	}

	public deleteTag(id: string) {
		if (id === '') {
			return
		}
		console.log(id)
		console.log(this.tags)
	}

	public close(): boolean {
		this.closeModal()

		return false
	}

	public undo(): void {
		this.editTask.reset({
			name: this.task.name,
			description: this.task.description,
			dueAt: this.task.dueAt.date.start.toDate().toISOString().slice(0, -1),
			workload: this.task.workloadOverall.toDuration(DurationUnit.Nanoseconds).milliseconds,
			priority: this.task.priority,
		})

		this.generateDurations(this.task)
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
			this.closeModal()
		})
	}

	public save(): boolean {
		if (!this.editTask.dirty) {
			return false
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

		updatingTask.workloadOverall =
			this.editTask.get('workload')?.dirty || this.isNew
				? this.editTask.get('workload')?.value.toDuration().toNanoseconds()
				: undefined

		if (this.isNew) {
			this.taskService.newTask(updatingTask).subscribe((task) => {
				this.editTask.markAsPristine()
				this.task = task
				this.taskId = task.id
				this.isNew = false
				this.router.navigate(['dashboard', { outlets: { modal: ['task', task.id] } }])
			})
		} else {
			this.taskService.patchTask(this.taskId, updatingTask).subscribe((task) => {
				this.editTask.markAsPristine()
			})
		}

		return false
	}
}
