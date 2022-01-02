import { Component, Input, OnInit } from '@angular/core'
import { Duration, DurationUnit } from 'src/app/models/duration'
import { Tag } from 'src/app/models/tag'
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

	tag?: Tag
	tags: Tag[] = []

	@Input() task!: Task
	@Input() loading = false

	now = new Date()

	DURATION = DurationUnit

	ngOnInit(): void {
		if (this.loading) {
			return
		}

		this.taskService.now.subscribe(now => {
			this.now = now
		})

		if (this.task.tags[0]) {
			this.taskService.tagsObservable.subscribe(newTags => {
				this.tags = []
				this.task.tags.forEach(tagId => {
					const foundTag = newTags.find(x => x.id === tagId)
					if (!foundTag) {
						return
					}
					this.tags.push(foundTag)
				})

				this.tag = this.tags[0]
			})
		}
	}
}
