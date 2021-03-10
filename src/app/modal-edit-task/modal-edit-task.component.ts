import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-edit-task',
  templateUrl: './modal-edit-task.component.html',
  styleUrls: ['./modal-edit-task.component.scss']
})
export class ModalEditTaskComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public close(): void {
    console.log('clicked close')
  }
}
