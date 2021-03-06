import { Component, Input, OnInit } from '@angular/core';
import { Task } from 'src/models/task';

@Component({
  selector: 'app-deadline',
  templateUrl: './deadline.component.html',
  styleUrls: ['./deadline.component.scss']
})
export class DeadlineComponent implements OnInit {

  constructor() { }

  @Input() task: Task | undefined;

  ngOnInit(): void {
  }

}
