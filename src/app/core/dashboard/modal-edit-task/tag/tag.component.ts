import { trigger, transition, style, animate } from '@angular/animations'
import { taggedTemplate } from '@angular/compiler/src/output/output_ast'
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core'
import { TaskComponent } from 'src/app/core/task.component'
import { Tag, TagModified } from 'src/app/models/tag'

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
	constructor(private elementRef: ElementRef) {
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

	@Input() tag!: Tag
	@Input() new = false
	@Output() valueChange = new EventEmitter<TagModified>()
	@Output() onDelete = new EventEmitter<string>()

	@ViewChild('input') input!: ElementRef

	isFocused = false
	allowSave = false
	showDropdown = false

	@HostListener('window:click', ['$event'])
	clickout(event: any) {
		const clickedInside = this.elementRef.nativeElement.contains(event.target)
		if (!clickedInside) {
			this.leaveFocus()
		} else {
			this.isFocused = true
		}
	}

	@HostListener('document:keydown', ['$event'])
	handleKeypresses(event: any): void {
		if (event.key === 'Enter' && this.isFocused) {
			event.preventDefault()
			this.save(event)
		}
	}

	logInput($event: any) {
		this.actualContent = $event.target.textContent
		if (this.actualContent !== this.tag.value && this.actualContent !== '') {
			this.allowSave = true
		} else {
			this.allowSave = false
		}
	}

	assignColor(event: any, color: string) {
		event.stopPropagation()
		event.preventDefault()

		this.selectedColor = color
		this.allowSave = true
	}

	save(event: any) {
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
		this.showDropdown = false
	}

	toggleDropdown(event: any, close?: boolean): void {
		event.stopPropagation()
		event.preventDefault()

		if (this.showDropdown || close) {
			this.showDropdown = false
		} else {
			this.showDropdown = true
		}
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
