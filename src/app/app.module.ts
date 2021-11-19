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
import { SettingsComponent } from './core/settings/settings.component'
import { httpInterceptorProviders } from './interceptors'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SigninComponent } from './signin/signin.component'
import { NgSelectModule } from '@ng-select/ng-select'
import { AngularSvgIconModule } from 'angular-svg-icon'
import { AngularSvgIconPreloaderModule } from 'angular-svg-icon-preloader'
import { StatsComponent } from './core/dashboard/stats/stats.component'
import { TagComponent } from './core/dashboard/modal-edit-task/tag/tag.component'
import { CircularProgressComponent } from './core/dashboard/circular-progress/circular-progress.component'
import { StatsSectionComponent } from './core/dashboard/stats-section/stats-section.component'
import { AgendaComponent } from './core/agenda/agenda.component'
import { DatetimePickerComponent } from './core/components/datetime-picker/datetime-picker.component'
import { DropdownComponent } from './core/components/dropdown/dropdown.component'
import { AgendaWorkUnitComponent } from './core/agenda/agenda-work-unit/agenda-work-unit.component'
import { AgendaDateGroupItemComponent } from './core/agenda/agenda-date-group-item/agenda-date-group-item.component'
import { GeneralComponent } from './core/settings/general/general.component'
import { CalendarsComponent } from './core/settings/calendars/calendars.component'
import { SectionComponent } from './core/settings/section/section.component'
import { GoogleCalendarSettingsComponent } from './core/components/google-calendar-settings/google-calendar-settings.component'
import { ToastService } from './services/toast.service'
import { TaskService } from './services/task.service'
import { NgxSplideModule } from 'ngx-splide'
import { TimezoneSelectComponent } from './core/components/timezone-select/timezone-select.component'
import { TimespanSelectComponent } from './core/components/timespan-select/timespan-select.component'
import { TimeSelectComponent } from './core/components/time-select/time-select.component'
import { AuthService } from './services/auth.service';
import { InputAccessorDirective } from './directives/input-accessor.directive'

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
		StatsComponent,
		TagComponent,
		CircularProgressComponent,
		StatsSectionComponent,
		AgendaComponent,
		DatetimePickerComponent,
		DropdownComponent,
		AgendaWorkUnitComponent,
		AgendaDateGroupItemComponent,
		GeneralComponent,
		CalendarsComponent,
		SectionComponent,
		GoogleCalendarSettingsComponent,
		TimezoneSelectComponent,
		TimespanSelectComponent,
		TimeSelectComponent,
  InputAccessorDirective,
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
		NgxSplideModule,
	],
	providers: [httpInterceptorProviders, ToastService, TaskService, AuthService],
	bootstrap: [AppComponent],
})
export class AppModule {}
