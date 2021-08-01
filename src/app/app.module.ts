import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { CoreComponent } from './core/core.component'
import { DashboardComponent } from './core/dashboard/dashboard.component'
import { DeadlineComponent } from './core/dashboard/deadline/deadline.component'
import { WorkUnitCardComponent } from './core/dashboard/work-unit/work-unit-card.component'
import { WorkUnitUpcomingComponent } from './core/dashboard/work-unit-upcoming/work-unit-upcoming.component'
import { ModalEditTaskComponent } from './core/dashboard/modal-edit-task/modal-edit-task.component'
import { SettingsComponent } from './core/dashboard/settings/settings.component'
import { httpInterceptorProviders } from './interceptors'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SigninComponent } from './signin/signin.component'
import { NgSelectModule } from '@ng-select/ng-select'
import { AngularSvgIconModule } from 'angular-svg-icon'
import { AngularSvgIconPreloaderModule } from 'angular-svg-icon-preloader'
import { SliderComponent } from './core/dashboard/slider/slider.component'
import { StatsComponent } from './core/dashboard/stats/stats.component'
import { TagComponent } from './core/dashboard/modal-edit-task/tag/tag.component'
import { CircularProgressComponent } from './core/dashboard/circular-progress/circular-progress.component'

@NgModule({
	declarations: [
		AppComponent,
		CoreComponent,
		DashboardComponent,
		DeadlineComponent,
		WorkUnitCardComponent,
		WorkUnitUpcomingComponent,
		ModalEditTaskComponent,
		SettingsComponent,
		SigninComponent,
		SliderComponent,
		StatsComponent,
		TagComponent,
		CircularProgressComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		AngularSvgIconModule.forRoot(),
		AngularSvgIconPreloaderModule.forRoot({
			configUrl: './assets/config/svg-preload.json',
		}),
		NgSelectModule,
	],
	providers: [httpInterceptorProviders],
	bootstrap: [AppComponent],
})
export class AppModule {}
