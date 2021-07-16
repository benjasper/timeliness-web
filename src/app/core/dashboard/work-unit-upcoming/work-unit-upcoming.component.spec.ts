import { ComponentFixture, TestBed } from '@angular/core/testing'

import { WorkUnitUpcomingComponent } from './work-unit-upcoming.component'

describe('WorkUnitUpcomingComponent', () => {
	let component: WorkUnitUpcomingComponent
	let fixture: ComponentFixture<WorkUnitUpcomingComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [WorkUnitUpcomingComponent],
		}).compileComponents()
	})

	beforeEach(() => {
		fixture = TestBed.createComponent(WorkUnitUpcomingComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
