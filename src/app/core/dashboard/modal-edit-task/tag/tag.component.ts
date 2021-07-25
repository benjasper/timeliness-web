import { taggedTemplate } from '@angular/compiler/src/output/output_ast'
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core'
import { TaskComponent } from 'src/app/core/task.component'
import { Tag } from 'src/app/models/tag'

@Component({
	selector: 'app-tag',
	templateUrl: './tag.component.html',
	styleUrls: ['./tag.component.scss'],
})
export class TagComponent extends TaskComponent implements OnInit {
	constructor() {
		super()
	}

	actualContent = ''

	@Input() tag!: Tag
	@Input() new = false
	@Output() valueChange = new EventEmitter<string>()
	@Output() onDelete = new EventEmitter<string>()

	@ViewChild('input') input!: ElementRef;

	isFocused = false
	allowSave = false

	@HostListener('click', ['$event'])
	public onClick(event: any): void {
		event.stopPropagation()
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

	save(event: any) {
		event.stopPropagation()
		event.preventDefault()

		this.allowSave = false
		this.isFocused = false
		this.valueChange.emit(this.actualContent)

		if (this.new) {
			this.actualContent = ''
		}
		this.input.nativeElement.blur()
	}

	delete(event: Event) {
		this.onDelete.emit(this.tag.id)
		this.allowSave = false
		this.isFocused = false
	}

	focus(event: any) {
		this.isFocused = true
	}

	leaveFocus(event: any) {
		if (event.relatedTarget && event.relatedTarget.localName === 'button') {
			return
		}

		this.isFocused = false

		this.actualContent = this.tag.value
		this.allowSave = false
	}

	ngOnInit(): void {
		this.actualContent = this.tag.value
	}
}
