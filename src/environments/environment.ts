// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from './environment-interface'

export const environment: Environment = {
	production: false,
	apiBaseUrl: 'http://localhost',
	firebase: {
		apiKey: 'AIzaSyCRZOikaWuIgXWlTKUPuSljAQTdWHF61jU',
		authDomain: 'project-tasks-294214.firebaseapp.com',
		projectId: 'project-tasks-294214',
		storageBucket: 'project-tasks-294214.appspot.com',
		messagingSenderId: '570716917094',
		appId: '1:570716917094:web:e356552cf293fcff454ca7',
	},
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
