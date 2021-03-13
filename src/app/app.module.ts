import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreComponent } from './core/core.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { DeadlineComponent } from './core/dashboard/deadline/deadline.component';
import { WorkUnitCardComponent } from './core/dashboard/work-unit/work-unit-card.component';
import { WorkUnitUpcomingComponent } from './core/dashboard/work-unit-upcoming/work-unit-upcoming.component';
import { ModalEditTaskComponent } from './core/dashboard/modal-edit-task/modal-edit-task.component';
import { SettingsComponent } from './core/dashboard/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    CoreComponent,
    LoginComponent,
    DashboardComponent,
    DeadlineComponent,
    WorkUnitCardComponent,
    WorkUnitUpcomingComponent,
    ModalEditTaskComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
