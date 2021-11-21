import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'

@Component({
	selector: 'app-verification',
	templateUrl: './verification.component.html',
})
export class VerificationComponent implements OnInit {
	constructor(private route: ActivatedRoute, private authService: AuthService) {}

	success = false
	initiatedHere = true

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			if (params.success) {
				this.success = true
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
