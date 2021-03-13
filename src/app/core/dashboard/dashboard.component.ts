import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  public deadlines: Task[] = []

  ngOnInit(): void {
    this.deadlines.push(
      {
        id: '',
        userId: '',
        createdAt: new Date(),
        lastModifiedAt: new Date(),
        workUnits: [],
        workloadOverall: 36000000000000,
        tags: [],
        name: 'Testtask',
        description: 'Description',
        isDone: false,
        priority: 2,
        dueAt: {
          date: {
            start: new Date(),
            end: new Date()
          }
        }
      }
    )
  }

}
