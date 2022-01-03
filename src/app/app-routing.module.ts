import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CoreComponent } from './core/core.component'
import { DashboardComponent } from './core/pages/dashboard/dashboard.component'
import { SettingsComponent } from './core/pages/settings/settings.component'
import { ModalEditTaskComponent } from './core/components/modal-edit-task/modal-edit-task.component'
import { SigninComponent } from './pages/auth/signin/signin.component'
import { AuthGuard } from './guards/auth.guard'
import { NoAuthGuard } from './guards/no-auth.guard'
import { AgendaComponent } from './core/pages/agenda/agenda.component'
import { GeneralComponent } from './core/pages/settings/general/general.component'
import { CalendarsComponent } from './core/pages/settings/calendars/calendars.component'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { AuthComponent } from './pages/auth/auth.component'
import { VerificationComponent } from './pages/auth/verification/verification.component'
import { NotVerifiedGuard } from './guards/not-verified.guard'
import { SuccessGoogleComponent } from './pages/static/success-google/success-google.component'
import { OnboardingComponent } from './pages/onboarding/onboarding.component'
import { NoOnboardingGuard } from './guards/no-onboarding.guard'
import { TutorialComponent } from './core/pages/dashboard/tutorial/tutorial.component'

const routes: Routes = [
	{
		path: '',
		component: CoreComponent,
		canActivate: [AuthGuard, NotVerifiedGuard, NoOnboardingGuard],
		children: [
			{
				path: 'dashboard',
				component: DashboardComponent,
				data: { animation: 'dashboard' },
				children: [
					{
						path: 'task/:id',
						component: ModalEditTaskComponent,
					},
					{
						path: 'tutorial',
						component: TutorialComponent,
					},
				],
			},
			{
				path: 'agenda',
				data: { animation: 'agenda' },
				component: AgendaComponent,
				children: [
					{
						path: 'task/:id',
						component: ModalEditTaskComponent,
					},
				],
			},
			{
				path: 'settings',
				component: SettingsComponent,
				data: { animation: 'settings' },
				children: [
					{ path: '', redirectTo: '/settings/general', pathMatch: 'full', data: { animation: 'settings' }, },
					{ path: 'general', component: GeneralComponent, pathMatch: 'full', data: { animation: 'settings' }, },
					{ path: 'calendars', component: CalendarsComponent, pathMatch: 'full', data: { animation: 'settings' }, },
				],
			},
			{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
		],
	},
	{
		path: 'auth',
		component: AuthComponent,
		children: [
			{
				path: 'signin',
				component: SigninComponent,
				canActivate: [NoAuthGuard],
			},
			{
				path: 'signup',
				component: SignupComponent,
				canActivate: [NoAuthGuard],
			},
			{
				path: 'verify',
				component: VerificationComponent,
			},
			{ path: '', redirectTo: '/auth/signin', pathMatch: 'full' },
		],
	},
	{
		path: 'onboarding',
		component: OnboardingComponent,
	},
	{
		path: 'static',
		children: [
			{
				path: 'google-connected',
				component: SuccessGoogleComponent,
			},
		],
	},
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{
		path: '**',
		redirectTo: '/dashboard',
	},
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
