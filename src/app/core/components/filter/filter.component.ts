import { Component, ElementRef, HostListener, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core'
import { flyInOut, flyInOutWithTransform, modalFlyInOut } from 'src/app/animations'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

export enum FilterTypes {
	Boolean,
	Tags,
}

export class FilterConfig {
	constructor(public identifier: string, public label: string, public icon: string, public type: FilterTypes, public allowsMultiple: boolean = false) {}
}

export class Filter {
	constructor(public value: boolean | string | number, public config: FilterConfig) {}
}

@Component({
	selector: 'app-filter',
	templateUrl: './filter.component.html',
	animations: [
		flyInOutWithTransform('', 50)
	],
	styleUrls: ['./filter.component.scss'],
})
export class FilterComponent extends TaskComponent implements OnInit {
	isFocused = false

	showTags?: FilterConfig
	tagSearch = ''

	FILTER_TYPES = FilterTypes
	filters: Filter[] = []

	@Input() filterConfig = [
		new FilterConfig('isDone', 'Deadline is complete', 'icon-deadline', FilterTypes.Boolean),
		new FilterConfig('tags', '', 'icon-tag', FilterTypes.Tags),
	]

	@ViewChildren('dropdown') dropdownElement!: QueryList<ElementRef>
	@ViewChild('search', { static: false }) search!: ElementRef

	constructor(private elementRef: ElementRef, public taskService: TaskService) {
		super()
	}

	@HostListener('document:click', ['$event'])
	clickout(event: Event) {
		let clickedInside = this.elementRef.nativeElement.contains(event.target)

		if (!clickedInside) {
			this.isFocused = false
			this.showTags = undefined
		} else {
			if (this.isFocused && this.dropdownElement.some(x => x.nativeElement.contains(event.target)) && !this.search.nativeElement.contains(event.target)) {
				this.isFocused = false
				this.showTags = undefined
				return
			}
		}
	}

	ngOnInit(): void {}

	show() {
		this.isFocused = true
	}

	showTagsDropdown() {
		this.showTags = this.filterConfig.find(f => f.type === FilterTypes.Tags)
		this.isFocused = false
	}

	getTagByValue(value: any) {
		return this.taskService.getTagByValue(value)?.color
	}

	removeFilter(filter: Filter) {
		this.filters = this.filters.filter(f => f !== filter)
	}

	includesFilter(config: FilterConfig) {
		return this.filters.some(filter => filter.config.identifier === config.identifier)
	}

	includesFilterValue(value: any) {
		return this.filters.some(filter => filter.value === value)
	}

	addToFilter(config: FilterConfig, value: any) {
		this.showTags = undefined
		
		if (this.includesFilter(config) && this.includesFilterValue(value)) {
			this.filters = this.filters.filter(f => !(f.config === config && f.value === value))
			return
		}

		this.filters.push(
			new Filter(value, config)
		)
	}
}
