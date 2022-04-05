import { Environment, EnvironmentStatus } from './environment-interface'

export const environment: Environment = {
	production: true,
	apiBaseUrl: 'https://staging.api.timeliness.app',
	environment: EnvironmentStatus.Staging,
}
