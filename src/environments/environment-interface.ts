export interface Environment {
	/** @deprecated use environment instead */
	production: boolean
	apiBaseUrl: string
	environment: EnvironmentStatus
}

export enum EnvironmentStatus {
	Production = 'production',
	Staging = 'staging',
	Local = 'local',
}
