import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CoreComponent } from './core/core.component'
import { DashboardComponent } from './core/dashboard/dashboard.component'
import { SettingsComponent } from './core/settings/settings.component'
import { ModalEditTaskComponent } from './core/dashboard/modal-edit-task/modal-edit-task.component'
import { SigninComponent } from './signin/signin.component'
import { AuthGuard } from './guards/auth.guard'
import { NoAuthGuard } from './guards/no-auth.guard'
import { AgendaComponent } from './core/agenda/agenda.component'

const routes: Routes = [
	{
		path: '',
		component: CoreComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'dashboard',
				component: DashboardComponent,
				children: [
					{
						path: 'task/:id',
						component: ModalEditTaskComponent,
						outlet: 'modal',
					},
				],
			},
			{
				path: 'agenda',
				component: AgendaComponent,
			},
			{
				path: 'settings',
				component: SettingsComponent,
			},
			{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
		],
	},
	{
		path: 'signin',
		component: SigninComponent,
		canActivate: [NoAuthGuard],
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
