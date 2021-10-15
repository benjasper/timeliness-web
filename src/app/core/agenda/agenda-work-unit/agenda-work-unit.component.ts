import { Component, Input, OnInit } from '@angular/core';
import { Tag } from 'src/app/models/tag';
import { Task, TaskAgenda } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';
import { TaskComponent } from '../../task.component';

@Component({
  selector: 'app-agenda-work-unit',
  templateUrl: './agenda-work-unit.component.html',
  styleUrls: ['./agenda-work-unit.component.scss']
})
export class AgendaWorkUnitComponent extends TaskComponent implements OnInit {
	constructor(private taskService: TaskService) {
		super()
	}

	tag?: Tag
	tags: Tag[] = []

	@Input() task!: TaskAgenda
	@Input() loading = false

	ngOnInit(): void {
		if (this.loading) {
			return
		}

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
