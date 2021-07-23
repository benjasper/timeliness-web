import { Injectable } from '@angular/core'
import { AngularFireMessaging } from '@angular/fire/messaging'

@Injectable({
	providedIn: 'root',
})
export class UserService {
	constructor(private afMessaging: AngularFireMessaging) {
		this.requestPermission()

		this.afMessaging.messages.subscribe(message => {
			console.log(message)
		})
	}

	requestPermission() {
		this.afMessaging.requestToken.subscribe(
			(token) => {
				console.log('Permission granted! Save to the server!', token)
			},
			(error) => {
				console.error(error)
			}
		)
	}
}
