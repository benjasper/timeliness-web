import { HttpStatusCode } from "@angular/common/http";

export interface ApiError {
	error: {
		type: ApiErrorTypes
		message: string
		trackId: string
	}

	status: HttpStatusCode
}

export enum ApiErrorTypes {
	Other = "other",
	Calendar = "calendar",
}