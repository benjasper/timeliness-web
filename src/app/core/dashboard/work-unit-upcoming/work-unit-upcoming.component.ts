import { Component, Input, OnInit } from '@angular/core'
import { Tag } from 'src/app/models/tag'
import { TaskUnwound } from 'src/app/models/task'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

@Component({
	selector: 'app-work-unit-upcoming',
	templateUrl: './work-unit-upcoming.component.html',
	styleUrls: ['./work-unit-upcoming.component.scss'],
})
export class WorkUnitUpcomingComponent extends TaskComponent implements OnInit {
	constructor(private taskService: TaskService) {
		super()
	}

	tag?: Tag

	@Input() task!: TaskUnwound
	@Input() loading = false

	ngOnInit(): void {
		if (this.loading) {
			return
		}

		if (this.task.tags[0]) {
			this.tag = this.taskService.getTag(this.task.tags[0])

			this.taskService.tagsObservable.subscribe(newTags => {
				const foundTag = newTags.find(x => x.id === this.task.tags[0])
				if (foundTag) {
					this.tag = foundTag
				}
			})
		}
	}
}
