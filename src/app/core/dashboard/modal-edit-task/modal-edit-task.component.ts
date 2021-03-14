import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
	selector: 'app-modal-edit-task',
	templateUrl: './modal-edit-task.component.html',
	styleUrls: ['./modal-edit-task.component.scss'],
})
export class ModalEditTaskComponent implements OnInit {
	constructor(private router: Router) {}

	ngOnInit(): void {}

	public close(): void {
		console.log('clicked close')
		this.router.navigate(['dashboard', { outlets: { modal: null } }])
	}
}
