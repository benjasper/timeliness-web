export interface OnboardingStep {
	identifier: string
	isDone: boolean
	evaluate: () => Promise<boolean>
}