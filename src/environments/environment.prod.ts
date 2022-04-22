import { Environment, EnvironmentStatus } from './environment-interface'

export const environment: Environment = {
	production: true,
	apiBaseUrl: 'https://api.timeliness.app',
	environment: EnvironmentStatus.Production,
}
