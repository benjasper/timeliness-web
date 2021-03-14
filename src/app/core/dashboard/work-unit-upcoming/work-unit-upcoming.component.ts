import { Component, Input, OnInit } from '@angular/core'
import { TaskUnwound } from 'src/app/models/task'

@Component({
	selector: 'app-work-unit-upcoming',
	templateUrl: './work-unit-upcoming.component.html',
	styleUrls: ['./work-unit-upcoming.component.scss'],
})
export class WorkUnitUpcomingComponent implements OnInit {
	constructor() {}

	@Input() task!: TaskUnwound
	ngOnInit(): void {}
}
