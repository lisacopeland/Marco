import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SummaryComponent } from './summary/summary.component';
import { DetailComponent } from './detail/detail.component';
import { ReleasePlanEditDialogComponent } from './releaseplanedit/releaseplanedit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AboutComponent } from './about/about.component';
import { NodeDashboardComponent } from './nodedetail/nodedetail.component';

@NgModule({
  declarations: [
    AppComponent,
    SummaryComponent,
    DetailComponent,
    ReleasePlanEditDialogComponent,
    AboutComponent,
    NodeDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule
  ],
  providers: [],
  entryComponents: [
    ReleasePlanEditDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
