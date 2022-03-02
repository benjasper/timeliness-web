import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { sliderRoutes } from '../animations'
import { User } from '../models/user'
import { AuthService } from '../services/auth.service'

@Component({
	selector: 'app-core',
	templateUrl: './core.component.html',
	animations: [
		sliderRoutes
	]
})
export class CoreComponent implements OnInit {
	constructor(private authService: AuthService) {}
	public user?: User

	ngOnInit(): void {
		this.authService.user.subscribe(user => {
			if (user) {
				this.user = user
			}
		})
	}

	prepareRoute(outlet: RouterOutlet) {
		return outlet?.activatedRouteData?.['animation']
	}

	public logout(): void {
		this.authService.logout()
	}

	public triggerFeedback(): void {
		(window as any).freddyWidget.show(
			{
				custom_fields: {
					user_id: this.user?.id,
				},
				url: window.location.href
			}
		);
	}
}
