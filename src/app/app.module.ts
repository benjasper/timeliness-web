import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreComponent } from './core/core.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { DeadlineComponent } from './core/dashboard/deadline/deadline.component';
import { WorkUnitComponent } from './core/dashboard/work-unit/work-unit.component';

@NgModule({
  declarations: [
    AppComponent,
    CoreComponent,
    LoginComponent,
    DashboardComponent,
    DeadlineComponent,
    WorkUnitComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
