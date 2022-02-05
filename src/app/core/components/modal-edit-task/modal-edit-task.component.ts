import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { async, Subject } from 'rxjs'
import { switchMap, takeUntil } from 'rxjs/operators'
import { Duration, DurationUnit } from 'src/app/models/duration'
import { EventModified, Task, TaskModified } from 'src/app/models/task'
import { Tag, TagModified } from 'src/app/models/tag'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'
import { smoothHeight } from 'src/app/animations'
import { ModalService } from 'src/app/services/modal.service'
import { Toast, ToastType } from 'src/app/models/toast'
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component'
import { Title } from '@angular/platform-browser'
import { PageComponent } from 'src/app/pages/page'

@Component({
	selector: 'app-modal-edit-task',
	templateUrl: './modal-edit-task.component.html',
	animations: [
		trigger('modalBackground', [
			transition(':enter', [style({ opacity: 0 }), animate(100)]),
			transition(':leave', [animate(100, style({ opacity: 0.6 }))]),
		]),
		trigger('flyInOut', [
			transition(':enter', [style({ transform: 'translate(-50%, -150%)', opacity: 0 }), animate(200)]),
			transition(':leave', [animate(200, style({ transform: 'translate(-50%, 150%)', opacity: 0 }))]),
		]),
		trigger('shrinkOut', [
			state('in', style({ height: '*' })),
			transition('* => void', [style({ height: '*' }), animate(250, style({ height: '*' }))]),
		]),
		smoothHeight,
	],
})
export class ModalEditTaskComponent extends PageComponent implements OnInit, OnDestroy {
	taskId!: string
	task!: Task
	loaded = true
	modalBackground = false
	isNew = false
	loading = false
	workUnitId?: string

	startIndex = 0

	NANOSECONDS = DurationUnit.Nanoseconds

	emptyTag: Tag = {
		id: '',
		value: '',
		lastModifiedAt: '',
		color: '',
		createdAt: '',
		deleted: false,
	}

	public tags: Tag[] = []

	public today = new Date()
	public durations: Duration[] = []

	private ngUnsubscribe = new Subject()

	editTask!: FormGroup

	getRemainingWorkload = TaskComponent.getRemainingWorkload
	getFinishedWorkload = TaskComponent.getFinishedWorkload
	getProgress = TaskComponent.getProgress
	getColorClass = TaskComponent.getColorClass

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private taskService: TaskService,
		private modalService: ModalService,
		protected titleService: Title
	) {
		super(titleService)

		this.route.paramMap.subscribe((param) => {
			this.taskId = param.get('id') ?? ''
		})

		this.route.queryParamMap.subscribe((param) => {
			if (param.has('workUnit')) {
				this.workUnitId = param.get('workUnit') ?? undefined
			}
		})

		const interval = 60 * 60 * 1000
		const initialDate = new Date(Math.ceil(new Date().addDays(1).getTime() / interval) * interval)

		this.editTask = new FormGroup({
			name: new FormControl('', [Validators.required]),
			description: new FormControl(''),
			dueAt: new FormControl(initialDate, [Validators.required]),
			workload: new FormControl(new Duration(3600000).milliseconds, [Validators.required]),
		})
	}

	@HostListener('document:keydown.escape', ['$event'])
	handleEscape(event: KeyboardEvent): void {
		if (this.modalService.hasOpenModals()) {
			return
		}
		event.preventDefault()
		this.closeModal()
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
			this.isNew = true
			this.setTitle('New Task')
			return
		}

		this.loading = true
		this.taskService.getTask(this.taskId).subscribe(
			(task) => {
				this.patchForm(task)
				this.task = task
				this.loading = false

				this.setStartsAtWorkUnit()

				this.taskService.tasksObservable.pipe(takeUntil(this.ngUnsubscribe)).subscribe((task) => {
					if (task.id === this.task.id) {
						this.patchForm(task)
						this.task = task
						this.loading = false

						this.setStartsAtWorkUnit()
					}
				})

				this.registerForTags()
			},
			() => {
				this.router.navigate(['.'], { relativeTo: this.route.parent })
			}
		)

		this.taskService.now.pipe(takeUntil(this.ngUnsubscribe)).subscribe((date) => {
			this.today = date
		})
	}

	registerForTags() {
		this.taskService.tagsObservable.subscribe((newTags) => {
			const removalList: string[] = []
			this.task.tags.forEach((tag, index) => {
				const foundTag = newTags.find((x) => x.id === tag)
				if (foundTag) {
					this.tags[index] = foundTag
				} else {
					removalList.push(tag)
				}
			})

			this.tags = this.tags.filter((x) => !removalList.includes(x.id))
		})
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next()
		this.ngUnsubscribe.complete()
	}

	promoteToFirst(tag: Tag) {
		const index = this.tags.findIndex((x) => x.value === tag.value)
		this.arraymove(this.tags, index, 0)
		this.editTask.markAsDirty()
	}

	workUnitSliderMove(event: any) {
		const index: number = event[2]
		this.workUnitId = this.task.workUnits[index].id

		// Set queryParam workUnit to new id

		this.router.navigate([], {
			relativeTo: this.route.parent,
			replaceUrl: true,
			queryParams: {
				workUnit: this.workUnitId,
			},
		})
	}

	private arraymove(arr: any, fromIndex: number, toIndex: number) {
		var element = arr[fromIndex]
		arr.splice(fromIndex, 1)

		arr.splice(toIndex, 0, element)
	}

	public setStartsAtWorkUnit() {
		if (!this.task) {
			return
		}

		let index = 0

		if (this.workUnitId) {
			index = this.task.workUnits.findIndex((x) => x.id === this.workUnitId)
		} else {
			index = this.task.workUnits.findIndex((x) => !x.isDone)
		}

		setTimeout(() => {
			this.startIndex = index === -1 ? 0 : index
		}, 50)
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

		if (task && this.durations.includes(task.workloadOverall.toDuration(DurationUnit.Nanoseconds)) === false) {
			this.durations.push(task.workloadOverall.toDuration(DurationUnit.Nanoseconds))
			this.durations.sort((a, b) => a.milliseconds - b.milliseconds)
		}
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
			dueAt: task.dueAt.date.start.toDate(),
			workload: task.workloadOverall.toDuration(DurationUnit.Nanoseconds).milliseconds,
		})
		this.generateDurations(task)

		this.setTitle(task.name)
	}

	public changeTag(tag: Tag, newValue: TagModified) {
		if (this.tags.find((x) => x.value === newValue.value && tag.id !== x.id)) {
			return
		}

		if (tag.id === '') {
			const existingTag = this.taskService.getTagByValue(newValue.value ?? '')
			if (existingTag) {
				const newTag = Object.assign({}, existingTag)
				newTag.color = newValue.color ?? newTag.color
				this.tags.push(newTag)
			} else if (this.tags.find((x) => x.value === newValue.value)) {
				const index = this.tags.findIndex((x) => x.value === newValue.value)
				tag.value = newValue.value ?? tag.value
				tag.color = newValue.color ?? tag.color
				this.tags[index] = tag
			} else {
				this.tags.push({
					id: '',
					value: newValue.value ?? '',
					color: newValue.color && newValue.color !== '' ? newValue.color : 'blue',
					lastModifiedAt: '',
					createdAt: '',
					deleted: false,
				})
			}
		} else {
			const index = this.tags.findIndex((x) => x.id === tag.id)

			const existingTag = this.taskService.getTagByValue(newValue.value ?? '')
			if (existingTag && existingTag.color === newValue.color) {
				this.tags[index] = existingTag
			} else {
				const newTag = Object.assign({}, existingTag ?? tag)
				newTag.value = newValue.value ?? ''
				newTag.color = newValue.color ?? ''
				this.tags[index] = newTag
			}
		}

		this.editTask.markAsDirty()
	}

	public deleteTag(id: string, value: string) {
		this.tags = this.tags.filter((x) => x.value !== value)
		// this.taskService.deleteTagFromTask(id)
		this.editTask.markAsDirty()
	}

	public close(): boolean {
		this.closeModal()

		return false
	}

	public undo(): void {
		this.patchForm(this.task)
		this.editTask.markAsPristine()

		this.generateDurations(this.task)
	}

	private closeModal(): void {
		this.loaded = false
		this.modalBackground = false
		setTimeout(() => {
			this.router.navigate(['.'], { relativeTo: this.route.parent })
		}, 200)
	}

	public delete(): void {
		this.modalService
			.addModal(ConfirmationModalComponent, {
				title: 'Delete task',
				message: 'Are you sure you want to delete this task?',
			})
			.subscribe((result) => {
				if (result.hasValue && result.result) {
					this.loading = true
					this.taskService.deleteTask(this.task).subscribe(
						() => {
							this.closeModal()
						},
						() => {
							this.loading = false
						}
					)
				}
			})
	}

	public async save(): Promise<boolean> {
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

		updatingTask.workloadOverall =
			this.editTask.get('workload')?.dirty || this.isNew
				? this.editTask.get('workload')?.value.toDuration().toNanoseconds()
				: undefined

		const newTags = this.tags.filter((x) => x.id === '')
		await Promise.all(
			newTags.map(async (tag) => {
				await this.taskService
					.newTag({
						value: tag.value,
						color: tag.color,
					})
					.toPromise()
					.then((newTag) => {
						// TODO: put back into right index
						this.tags = this.tags.filter((x) => x.value !== newTag.value)
						this.tags.push(newTag)
					})
			})
		)

		const potentiallyChangedTags = this.tags.filter((x) => x.id !== '')
		await Promise.all(
			potentiallyChangedTags.map(async (potentiallyChangedTag) => {
				const original = this.taskService.getTag(potentiallyChangedTag.id)
				const changedTag: TagModified = {}

				let changed = false
				if (original?.color !== potentiallyChangedTag.color) {
					changedTag.color = potentiallyChangedTag.color
					changed = true
				}

				if (original?.value !== potentiallyChangedTag.value) {
					changedTag.value = potentiallyChangedTag.value
					changed = true
				}

				if (!changed) {
					return
				}

				await this.taskService
					.changeTag(potentiallyChangedTag.id, changedTag)
					.toPromise()
					.then((newTag) => {
						const index = this.tags.findIndex((x) => x.id === newTag.id)
						this.tags[index] = newTag
					})
			})
		)

		let newTagsHash = ''
		this.tags.forEach((x) => (newTagsHash += x.id))

		const originalTagsHash = this.task?.tags.join('')

		if (newTagsHash !== originalTagsHash || this.isNew) {
			updatingTask.tags = []
			this.tags.forEach((tag) => {
				updatingTask.tags?.push(tag.id)
			})
		}

		this.loading = true

		if (this.isNew) {
			const observable = this.taskService.newTask(updatingTask)
			observable.subscribe(
				(task) => {
					this.editTask.markAsPristine()
					this.task = task
					this.taskId = task.id
					this.isNew = false
					this.loading = false
					this.setTitle(task.name)

					this.router.navigate(['task', task.id], {
						relativeTo: this.route.parent,
					})
				},
				() => {
					this.loading = false
				}
			)

			const toast = new Toast(ToastType.Success, `New task "${updatingTask.name}" created`)
			toast.loading = observable.toPromise()
			toast.loadingText = 'Creating task...'
			this.modalService.addToast(toast)
		} else {
			const observable = this.taskService.patchTask(this.taskId, updatingTask)
			observable.subscribe(
				(task) => {
					this.editTask.markAsPristine()
					this.loading = false
					this.setStartsAtWorkUnit()
				},
				() => {
					this.loading = false
				}
			)

			const toast = new Toast(ToastType.Success, 'Task updated')
			toast.loading = observable.toPromise()
			toast.loadingText = 'Updating task...'
			this.modalService.addToast(toast)
		}

		return false
	}
}
