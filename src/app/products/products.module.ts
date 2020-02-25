import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { ReleasePlanEditDialogComponent } from './releaseplanedit/releaseplanedit.component';
import { ReleasePlanDashboardComponent } from './releaseplan-dashboard/releaseplan-dashboard.component';
import { NodeDashboardComponent } from './nodedashboard/nodedashboard.component';
import { ProductDashboardComponent } from './product-dashboard/product-dashboard.component';
import { ProductEditDialogComponent } from './productedit/productedit.component';
import { AlertDialogModule } from '../alert-dialog/alert-dialog.module';

@NgModule({
  declarations: [
    ProductsComponent,
    ReleasePlanEditDialogComponent,
    ReleasePlanDashboardComponent,
    NodeDashboardComponent,
    ProductDashboardComponent,
    ProductEditDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    ProductsRoutingModule,
    AlertDialogModule
  ],
  entryComponents: [
    ReleasePlanEditDialogComponent,
    ProductEditDialogComponent
  ],
})
export class ProductsModule { }
