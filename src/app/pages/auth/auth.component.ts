import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fader } from 'src/app/animations';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  animations: [
    fader
  ]
})
export class AuthComponent implements OnInit {

  constructor() { }

  prepareRoute(outlet: RouterOutlet) {
		return outlet?.activatedRouteData?.['animation']
	}

  ngOnInit(): void {
  }

}
