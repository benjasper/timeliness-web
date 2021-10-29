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

	public collapsed = false
	public user: User|undefined = undefined

	ngOnInit(): void {
		if (localStorage.getItem('dashboard-sidebar') === 'collapsed') {
			this.collapsed = true
		}

		this.authService.user.subscribe(user => {
			if (user) {
				this.user = user
			}
		})
	}

	public switchSidebarCollapsed(): void {
		if (this.collapsed) {
			this.collapsed = false
		} else {
			this.collapsed = true
		}

		localStorage.setItem('dashboard-sidebar', this.collapsed ? 'collapsed' : '')
	}

	public logout(): void {
		this.authService.logout()
	}
}
