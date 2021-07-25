import { taggedTemplate } from '@angular/compiler/src/output/output_ast'
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core'
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

	actualContent = ""

	@Input() tag!: Tag
	@Output() valueChange = new EventEmitter<string>()
	@Output() onDelete = new EventEmitter<string>()

	isFocused = false
	allowSave = false
	new = false

	@HostListener("click", ["$event"])
    public onClick(event: any): void
    {
        event.stopPropagation();
    }

	logInput($event: any) {
		this.actualContent = $event.target.textContent
		if ((this.actualContent !== this.tag.value) && this.actualContent !== "") {
			this.allowSave = true
		} else {
			this.allowSave = false
		}
	}

	save(event: Event) {
		const id = this.tag.id
		this.allowSave = false
		this.isFocused = false
		this.valueChange.emit(this.actualContent)
		
		if (id === "") {
			this.actualContent = ""
		}
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
		console.log(event)
		if (event.relatedTarget && event.relatedTarget.localName === "button") {
			return
		}

		this.isFocused = false

		this.actualContent = this.tag.value
		this.allowSave = false
	}

	ngOnInit(): void {
		this.actualContent = this.tag.value
		if (this.tag.id === "") {
			this.new = true
		}
	}
}
