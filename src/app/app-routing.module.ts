import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CoreComponent } from './core/core.component'
import { DashboardComponent } from './core/dashboard/dashboard.component'
import { LoginComponent } from './login/login.component'

const routes: Routes = [
    {
        path: '',
        component: CoreComponent, // this is the component with the <router-outlet> in the template
        children: [
            {
                path: 'dashboard', // child route path
                component: DashboardComponent, // child route component that the router renders
            },
            { path: '',   redirectTo: '/dashboard', pathMatch: 'full' }
        ],
    },
    {
        path: 'login',
        component: LoginComponent, // this is the component with the <router-outlet> in the template
    },
    { path: '',   redirectTo: '/dashboard', pathMatch: 'full' }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
