import { HttpStatusCode } from "@angular/common/http";

export interface ApiError {
	error: {
		message: string
	}

	status: HttpStatusCode
}