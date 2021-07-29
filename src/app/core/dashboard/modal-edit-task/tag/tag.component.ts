import { trigger, transition, style, animate } from '@angular/animations'
import { taggedTemplate } from '@angular/compiler/src/output/output_ast'
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core'
import { TaskComponent } from 'src/app/core/task.component'
import { Tag, TagModified } from 'src/app/models/tag'
import { TaskService } from 'src/app/services/task.service'

@Component({
	selector: 'app-tag',
	templateUrl: './tag.component.html',
	styleUrls: ['./tag.component.scss'],
	animations: [
		trigger('appear', [
			transition(':enter', [style({ opacity: 0 }), animate(200)]),
			transition(':leave', [animate(200, style({ opacity: 0 }))]),
		]),
	],
})
export class TagComponent extends TaskComponent implements OnInit {
	constructor(private elementRef: ElementRef, private taskService: TaskService) {
		super()
	}

	colorsAvailable: Color[] = [
		{ name: 'Blue', key: 'blue' },
		{ name: 'Violet', key: 'violet' },
		{ name: 'Green', key: 'green' },
		{ name: 'Yellow', key: 'yellow' },
		{ name: 'Pink', key: 'pink' },
	]

	actualContent = ''
	selectedColor = ''
	suggestions: Tag[] = []

	@Input() tag!: Tag
	@Input() new = false
	@Input() existingTags: Tag[]  = []
	@Output() valueChange = new EventEmitter<TagModified>()
	@Output() onDelete = new EventEmitter<string>()

	@ViewChild('input') input!: ElementRef

	isFocused = false
	allowSave = false
	showColorDropdown = false
	showSuggestionDropdown = false

	@HostListener('document:click', ['$event'])
	clickout(event: Event) {
		const clickedInside = this.elementRef.nativeElement.contains(event.target)
		if (!clickedInside) {
			this.leaveFocus()
		} else {
			this.isFocused = true
		}
	}

	@HostListener('document:keydown', ['$event'])
	handleKeypresses(event: KeyboardEvent): void {
		if (event.key === 'Enter' && this.isFocused) {
			event.preventDefault()
			this.save(event)
		}
	}

	logInput(event: Event) {
		this.actualContent = (event.target as HTMLElement).textContent ?? ''
		if (this.actualContent !== this.tag.value && this.actualContent !== '') {
			this.allowSave = true
		} else {
			this.allowSave = false
		}
		this.getSuggestions()
	}

	assignColor(event: Event, color: string) {
		event.stopPropagation()
		event.preventDefault()

		this.selectedColor = color
		this.allowSave = true
		this.getSuggestions()
	}

	save(event: Event) {
		event.stopPropagation()
		event.preventDefault()

		this.valueChange.emit({ value: this.actualContent, color: this.selectedColor })

		if (this.new) {
			this.actualContent = ''
			this.tag.color = ''
		}
		this.input.nativeElement.blur()
		this.leaveFocus()
	}

	delete(event: Event) {
		event.stopPropagation()
		event.preventDefault()

		this.onDelete.emit(this.tag.id)
		this.allowSave = false
		this.isFocused = false
	}

	leaveFocus() {
		this.isFocused = false

		this.actualContent = this.tag.value
		this.selectedColor = this.tag.color
		this.allowSave = false
		this.showColorDropdown = false
		this.showSuggestionDropdown = false
	}

	toggleDropdown(event: Event, close?: boolean): void {
		event.stopPropagation()
		event.preventDefault()

		if (this.showColorDropdown || close) {
			this.showColorDropdown = false
		} else {
			this.showColorDropdown = true
		}
	}

	getSuggestions() {
		const prompt = this.actualContent
		let suggestions: Tag[]

		if (prompt === '') {
			suggestions = this.taskService.getAllTags()
		} else {
			suggestions = this.taskService.getTagsBySearch(prompt)
		}

		suggestions = suggestions.filter((x) => x.value !== prompt || (x.value === prompt && x.color !== this.selectedColor))
		const exisitngTagValues = this.existingTags.map(x => x.value)
		suggestions = suggestions.filter((x) => !exisitngTagValues.includes(x.value))
		this.suggestions = suggestions
	}

	assignSuggestion(tag: Tag, event: Event) {
		event.stopPropagation()

		this.selectedColor = tag.color
		this.actualContent = tag.value

		this.allowSave = true
		this.getSuggestions()
	}

	textFocus(event: Event) {
		this.getSuggestions()
		this.showSuggestionDropdown = true
		this.showColorDropdown = false
	}

	textleavesFocus(event: Event) {
		// this.showSuggestionDropdown = false
	}

	ngOnInit(): void {
		this.actualContent = this.tag.value
		this.selectedColor = this.tag.color
	}
}

interface Color {
	name: string
	key: string
}
