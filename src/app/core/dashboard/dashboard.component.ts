import { Component, OnInit } from '@angular/core'
import { Task, TaskUnwound } from 'src/app/models/task'

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	constructor() {}

	public deadlines: Task[] = []
	public nextUp: TaskUnwound[] = []
	public upcoming: TaskUnwound[] = []

	ngOnInit(): void {
		this.deadlines.push({
			id: '123456',
			userId: '',
			createdAt: new Date(),
			lastModifiedAt: new Date(),
			workUnits: [],
			workloadOverall: 36000000000000,
			tags: [],
			name: 'Testtask',
			description: 'Description',
			isDone: false,
			priority: 2,
			dueAt: {
				date: {
					start: new Date(),
					end: new Date(),
				},
			},
		})

		const taskUnwound = {
			id: '123',
			userId: '',
			createdAt: new Date(),
			lastModifiedAt: new Date(),
			workUnits: [
				{
					id: '',
					scheduledAt: {
						date: {
							start: new Date(),
							end: new Date(),
						},
					},
					isDone: false,
					workload: 36000000000000,
					markedDoneAt: new Date(),
				},
			],
			workloadOverall: 36000000000000,
			tags: [],
			name: 'Testtask',
			description: '',
			isDone: false,
			priority: 2,
			dueAt: {
				date: {
					start: new Date(),
					end: new Date(),
				},
			},
			workUnit: {
				id: '1',
				scheduledAt: {
					date: {
						start: new Date(),
						end: new Date(),
					},
				},
				isDone: false,
				workload: 36000000000000,
				markedDoneAt: new Date(),
			},
			workUnitsCount: 1,
			workUnitsIndex: 0,
		}

		this.nextUp.push(taskUnwound)
		this.upcoming.push(taskUnwound)
	}
}
