import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  animations: [
		trigger('flyInOut', [
			transition(':enter', [style({ transform: 'translate(-50%, -250%)', opacity: 0 }), animate(200)]),
			transition(':leave', [animate(200, style({ transform: 'translate(-50%, 150%)', opacity: 0 }))]),
		]),
	],
  
})
export class TutorialComponent implements OnInit {

  constructor(private router: Router) { }

  isShowing = true

  ngOnInit(): void {
  }

  close() {
	  this.isShowing = false
	  setTimeout(() => {
		  this.router.navigate(['/dashboard'])
	  }, 200)
  }

}
