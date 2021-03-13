import { Component, Input, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task';

@Component({
  selector: 'app-work-unit-card',
  templateUrl: './work-unit-card.component.html',
  styleUrls: ['./work-unit-card.component.scss']
})
export class WorkUnitCardComponent implements OnInit {

  constructor() { }

  @Input() task: Task | undefined

  ngOnInit(): void {
    this.task = {
      id: '',
      userId: '',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      workUnits: [],
      workloadOverall: 0,
      tags: [],
      name: '',
      description: '',
      isDone: false,
      priority: 1,
      dueAt: {
        date: {
          start: new Date(),
          end: new Date()
        }
      }
    }
    if (!this.task) {
      throw new TypeError('\'Task\' is required');
    }
  }

}
