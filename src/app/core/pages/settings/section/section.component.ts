import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html'
})
export class SectionComponent implements OnInit {

  constructor() { }

  @Input() name!: string
  @Input() description?: string

  ngOnInit(): void {
  }

}
