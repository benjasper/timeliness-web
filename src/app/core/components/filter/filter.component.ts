import {
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	Output,
	QueryList,
	ViewChild,
	ViewChildren,
} from '@angular/core'
import { flyInOut, flyInOutWithTransform, modalFlyInOut } from 'src/app/animations'
import { Tag } from 'src/app/models/tag'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

export enum FilterTypes {
	Boolean,
	Tags,
}

export class FilterConfig {
	constructor(
		public identifier: string,
		public label: string,
		public labelNegated: string,
		public icon: string,
		public type: FilterTypes,
		public allowsMultiple: boolean = false
	) {}
}

export class Filter {
	constructor(public value: boolean | string | number, public isTrue: boolean, public config: FilterConfig) {}

	toQueryParameter(): string {
		const operator = this.isTrue ? '$eq' : '$ne'
		return `${operator}:${this.value}`
	}

	static filtersToQueryParameter(filters: Filter[], filterConfigs: FilterConfig[]): string[] {
		const filterGroups: Filter[][] = []
		for (const filterConfig of filterConfigs) {
			const group = filters.filter((x) => x.config.identifier === filterConfig.identifier)
			if (group.length === 0) {
				continue
			}

			filterGroups.push(group)
		}

		return filterGroups.map((x) => x[0].config.identifier + '=' + x.map((x) => x.toQueryParameter()).join(','))
	}
}

@Component({
	selector: 'app-filter',
	templateUrl: './filter.component.html',
	animations: [flyInOutWithTransform('', 50)],
	styleUrls: ['./filter.component.scss'],
})
export class FilterComponent extends TaskComponent implements OnInit {
	isFocused = false

	showTags?: FilterConfig
	tagSearch = ''

	FILTER_TYPES = FilterTypes

	@Input() filters: Filter[] = []
	@Input() filterConfig: FilterConfig[] = []

	@Output() onFilter = new EventEmitter<Filter[]>()

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
			if (
				this.isFocused &&
				this.dropdownElement.some((x) => x.nativeElement.contains(event.target)) &&
				!this.search.nativeElement.contains(event.target)
			) {
				this.isFocused = false
				this.showTags = undefined
				return
			}
		}
	}

	ngOnInit(): void {}

	@HostListener('document:keydown.escape', ['$event'])
	handleEscape(event: KeyboardEvent): void {
		event.preventDefault()
		if (this.showTags) {
			this.showTags = undefined
			this.isFocused = true
			return
		}

		this.isFocused = false
	}

	show() {
		this.isFocused = true
	}

	showTagsDropdown() {
		this.showTags = this.filterConfig.find((f) => f.type === FilterTypes.Tags)
		this.isFocused = false
		setTimeout(() => this.search.nativeElement.focus(), 0)
	}

	getTagById(value: any): Tag | undefined {
		return this.taskService.getTag(value)
	}

	removeFilter(filter: Filter) {
		this.filters = this.filters.filter((f) => f !== filter)
		this.onFilter.emit(this.filters)
	}

	includesFilter(config: FilterConfig) {
		return this.filters.some((filter) => filter.config.identifier === config.identifier)
	}

	includesFilterValue(value: any) {
		return this.filters.some((filter) => filter.value === value)
	}

	addToFilter(config: FilterConfig, value: any) {
		this.showTags = undefined

		if (this.includesFilter(config) && this.includesFilterValue(value)) {
			this.filters = this.filters.filter((f) => !(f.config === config && f.value === value))
			this.onFilter.emit(this.filters)
			return
		}

		this.filters.push(new Filter(value, true, config))
		this.onFilter.emit(this.filters)
	}

	updateFilter(filter: Filter, isTrue: boolean, value: any) {
		filter.isTrue = isTrue
		filter.value = value
		
		this.onFilter.emit(this.filters)
	}
}
