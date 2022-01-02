import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { CoreComponent } from './core/core.component'
import { DashboardComponent } from './core/pages/dashboard/dashboard.component'
import { DeadlineComponent } from './core/components/deadline/deadline.component'
import { WorkUnitCardComponent } from './core/components/work-unit/work-unit-card.component'
import { WorkUnitUpcomingComponent } from './core/pages/dashboard/work-unit-upcoming/work-unit-upcoming.component'
import { ModalEditTaskComponent } from './core/components/modal-edit-task/modal-edit-task.component'
import { SettingsComponent } from './core/pages/settings/settings.component'
import { httpInterceptorProviders } from './interceptors'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SigninComponent } from './pages/auth/signin/signin.component'
import { NgSelectModule } from '@ng-select/ng-select'
import { AngularSvgIconModule } from 'angular-svg-icon'
import { AngularSvgIconPreloaderModule } from 'angular-svg-icon-preloader'
import { StatsComponent } from './core/pages/dashboard/stats/stats.component'
import { TagComponent } from './core/components/modal-edit-task/tag/tag.component'
import { CircularProgressComponent } from './core/components/circular-progress/circular-progress.component'
import { StatsSectionComponent } from './core/pages/dashboard/stats-section/stats-section.component'
import { AgendaComponent } from './core/pages/agenda/agenda.component'
import { DatetimePickerComponent } from './core/components/datetime-picker/datetime-picker.component'
import { DropdownComponent } from './core/components/dropdown/dropdown.component'
import { AgendaWorkUnitComponent } from './core/pages/agenda/agenda-work-unit/agenda-work-unit.component'
import { AgendaDateGroupItemComponent } from './core/pages/agenda/agenda-date-group-item/agenda-date-group-item.component'
import { GeneralComponent } from './core/pages/settings/general/general.component'
import { CalendarsComponent } from './core/pages/settings/calendars/calendars.component'
import { SectionComponent } from './core/pages/settings/section/section.component'
import { GoogleCalendarSettingsComponent } from './core/components/google-calendar-settings/google-calendar-settings.component'
import { TaskService } from './services/task.service'
import { NgxSplideModule } from 'ngx-splide'
import { TimezoneSelectComponent } from './core/components/timezone-select/timezone-select.component'
import { TimespanSelectComponent } from './core/components/timespan-select/timespan-select.component'
import { TimeSelectComponent } from './core/components/time-select/time-select.component'
import { AuthService } from './services/auth.service'
import { InputAccessorDirective } from './directives/input-accessor.directive'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { AuthComponent } from './pages/auth/auth.component'
import { VerificationComponent } from './pages/auth/verification/verification.component'
import { OnboardingComponent } from './pages/onboarding/onboarding.component'
import { SuccessGoogleComponent } from './pages/static/success-google/success-google.component'
import { TutorialComponent } from './core/pages/dashboard/tutorial/tutorial.component'
import { BusyPaddingComponent } from './core/components/busy-padding/busy-padding.component'
import { TimingPreferenceComponent } from './core/components/timing-preference/timing-preference.component'
import { ReschedulingModalComponent } from './core/modals/rescheduling-modal/rescheduling-modal.component'
import { defaultSimpleModalOptions, SimpleModalModule } from 'ngx-simple-modal'
import { ConfirmationModalComponent } from './core/modals/confirmation-modal/confirmation-modal.component'
import { ToastComponent } from './core/modals/toast/toast.component'

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
		SignupComponent,
		AuthComponent,
		VerificationComponent,
		OnboardingComponent,
		SuccessGoogleComponent,
		TutorialComponent,
		BusyPaddingComponent,
		TimingPreferenceComponent,
		ReschedulingModalComponent,
		ConfirmationModalComponent,
		ToastComponent,
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
		SimpleModalModule.forRoot(
			{ container: document.body },
			{
				...defaultSimpleModalOptions,
				...{
					closeOnEscape: true,
					closeOnClickOutside: true,
					animationDuration: 400,
					autoFocus: true,
				},
			}
		),
	],
	entryComponents: [ReschedulingModalComponent, ConfirmationModalComponent, ToastComponent],
	providers: [httpInterceptorProviders, TaskService, AuthService],
	bootstrap: [AppComponent],
})
export class AppModule {}
