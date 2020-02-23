import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { DeploymentsRoutingModule } from './deployments-routing.module';
import { DeploymentsComponent } from './deployments.component';


@NgModule({
  declarations: [DeploymentsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    DeploymentsRoutingModule
  ]
})
export class DeploymentsModule { }
