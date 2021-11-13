import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { User } from '../models/user'
import { AuthService } from '../services/auth.service'

@Component({
	selector: 'app-core',
	templateUrl: './core.component.html',
	styleUrls: ['./core.component.scss'],
})
export class CoreComponent implements OnInit {
	constructor(private authService: AuthService) {}
	public user: User|undefined = undefined

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (user) {
				this.user = user
			}
		})
	}

	public logout(): void {
		this.authService.logout()
	}
}
