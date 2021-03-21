import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CoreComponent } from './core/core.component'
import { DashboardComponent } from './core/dashboard/dashboard.component'
import { SettingsComponent } from './core/dashboard/settings/settings.component'
import { ModalEditTaskComponent } from './core/dashboard/modal-edit-task/modal-edit-task.component'
import { SigninComponent } from './signin/signin.component'
import { AuthGuard } from './guards/auth.guard'

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
				path: 'settings',
				component: SettingsComponent,
			},
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
		],
	},
	{
		path: 'signin',
		component: SigninComponent,
	},
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
