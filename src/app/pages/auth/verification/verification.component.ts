import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'
import { PageComponent } from '../../page'

@Component({
	selector: 'app-verification',
	templateUrl: './verification.component.html',
})
export class VerificationComponent extends PageComponent implements OnInit {
	constructor(private route: ActivatedRoute, private authService: AuthService, titleService: Title) {
		super(titleService)
	}

	success = false
	error = false
	initiatedHere = true

	ngOnInit(): void {
		this.setTitle('Email verification')

		this.route.queryParams.subscribe((params) => {
			if (params.success === "true") {
				this.success = true
				this.initiatedHere = false
			} else if (params.success === "false") {
				this.error = true
				this.initiatedHere = false
			} else {
				this.authService.user.subscribe(user => {
					if (user?.emailVerified) {
						this.success = true
					}
				})
		
				setInterval(() => {
					if (!this.success) {
						this.authService.forceUserUpdate()
					}
				}, 5000)
			}
		})
	}
}
