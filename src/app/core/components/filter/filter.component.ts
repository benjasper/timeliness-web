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
import { config } from 'process'
import { flyInOut, flyInOutWithTransform, modalFlyInOut } from 'src/app/animations'
import { Tag } from 'src/app/models/tag'
import { TaskService } from 'src/app/services/task.service'
import { TaskComponent } from '../../task.component'

export enum FilterTypes {
	Boolean,
	Tags,
}

export interface FilterOption {
	label: string
	operator: string
	value: string
	isConstant: boolean
}

export class FilterConfig {
	constructor(
		public identifier: string,
		public name: string,
		public filterOptions: FilterOption[],
		public icon: string,
		public type: FilterTypes,
		public allowsMultiple: boolean = false,
		public invertible: boolean = true
	) {}
}

export class Filter {
	constructor(public isInverted: boolean, public config: FilterConfig, public option: FilterOption) {}

	toQueryParameter(): string {
		const operator = this.option.operator
		return `${operator}:${this.option.value}`
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

	static saveToLocalStorage(identifier: string, filters: Filter[]) {
		localStorage.setItem(identifier, JSON.stringify(filters))
	}

	static loadFromLocalStorage(identifier: string): Filter[] {
		const loadedData = localStorage.getItem(identifier)
		if (!loadedData) {
			return []
		}
		const data = JSON.parse(loadedData) ?? []
		return data.map((x: any) => new Filter(x.isTrue, x.config, x.option))
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

	createTagFilterOption(tag: Tag): FilterOption {
		return {
			label: this.filterConfig.find((x) => x.type === FilterTypes.Tags)!.filterOptions[0]!.label,
			operator: '$eq',
			value: tag.id,
			isConstant: false,
		}
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
		return this.filters.some((filter) => filter.option.value === value)
	}

	addToFilter(config: FilterConfig, option: FilterOption) {
		this.showTags = undefined

		if (this.includesFilter(config) && this.includesFilterValue(option.value)) {
			this.filters = this.filters.filter((f) => !(f.config === config && f.option.value === option.value))
			this.onFilter.emit(this.filters)
			return
		}

		this.filters.push(new Filter(false, config, option))
		this.onFilter.emit(this.filters)
	}

	invertFilter(filter: Filter) {
		if (filter.option.isConstant) {
			filter.option = filter.config.filterOptions.find((x) => x !== filter.option) ?? filter.option
		} else {
			filter.option = {...filter.config.filterOptions.find((x) => x.label !== filter.option.label)!, value: filter.option.value}
		}
		
		this.onFilter.emit(this.filters)
	}

	getTagFromTag(tag: any): Tag {
		return tag
	}
}
