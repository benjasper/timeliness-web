import { trigger, transition, style, animate } from '@angular/animations'
import { taggedTemplate } from '@angular/compiler/src/output/output_ast'
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core'
import { modalFlyInOut } from 'src/app/animations'
import { ConfirmationModalComponent } from 'src/app/core/modals/confirmation-modal/confirmation-modal.component'
import { TaskComponent } from 'src/app/core/task.component'
import { Tag, TagModified } from 'src/app/models/tag'
import { ModalService } from 'src/app/services/modal.service'
import { TaskService } from 'src/app/services/task.service'

@Component({
	selector: 'app-tag',
	templateUrl: './tag.component.html',
	styleUrls: ['./tag.component.scss'],
	animations: [
		
	],
})
export class TagComponent extends TaskComponent implements OnInit {
	constructor(private elementRef: ElementRef, private taskService: TaskService, private modalService: ModalService) {
		super()
	}

	colorsAvailable: Color[] = [
		{ name: 'Blue', key: 'blue' },
		{ name: 'Ice Blue', key: 'ice-blue' },
		{ name: 'Violet', key: 'violet' },
		{ name: 'Green', key: 'green' },
		{ name: 'Yellow', key: 'yellow' },
		{ name: 'Mango', key: 'mango' },
		{ name: 'Pink', key: 'pink' },
	]

	actualContent = ''
	selectedColor = ''
	suggestions: Tag[] = []

	@Input() tag!: Tag
	@Input() new = false
	@Input() existingTags: Tag[] = []
	@Input() isFirst = false
	@Output() valueChange = new EventEmitter<TagModified>()
	@Output() onDelete = new EventEmitter<string>()
	@Output() promoteTag = new EventEmitter<Tag>()

	@ViewChild('input') input!: ElementRef
	@ViewChild('suggestionDropdown') suggestionDropdown!: ElementRef

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

		if (this.tag.id === '') {
			this.onDelete.emit(this.tag.id)
			this.allowSave = false
			this.isFocused = false

			return
		}

		this.modalService.addModal(ConfirmationModalComponent, {
			title: 'Delete tag',
			message: 'How do you want to delete this tag? When you delete the tag itself it will be deleted from all other tasks using this tag as well.',
			confirmationModalOptions: [
				{ label: 'Delete tag itself', key: 'delete-tag' },
				{ label: 'Delete tag from task only', key: 'delete-from-task' },
			],
		}).subscribe((result) => {
			if (!result.hasValue || !result.result.result) {
				return
			}

			switch (result.result.resultKey) {
				case 'delete-tag':
					this.taskService.deleteTag(this.tag.id)
					break;
				case 'delete-from-task':
					break;
				default:
					throw new Error('Unsupported result key')
			}

			this.onDelete.emit(this.tag.id)
			this.allowSave = false
			this.isFocused = false
		})
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
			this.showSuggestionDropdown = false
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

		suggestions = suggestions.filter(
			(x) => x.value !== prompt || (x.value === prompt && x.color !== this.selectedColor)
		)
		const existingTagValues = this.existingTags.map((x) => x.value)
		suggestions = suggestions.filter((x) => !existingTagValues.includes(x.value))
		this.suggestions = suggestions
	}

	assignSuggestion(tag: Tag, event: Event) {
		event.stopPropagation()

		this.selectedColor = tag.color
		this.actualContent = tag.value

		this.save(event)
	}

	textFocus(event: Event) {
		this.getSuggestions()
		this.showSuggestionDropdown = true
		this.showColorDropdown = false
	}

	promoteToFirst(event: Event) {
		event.stopPropagation()

		this.promoteTag.emit(this.tag)
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
