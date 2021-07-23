import { FirebaseOptions } from "@angular/fire";

export interface Environment {
	production: boolean
	apiBaseUrl: string
	firebase: FirebaseOptions
}
