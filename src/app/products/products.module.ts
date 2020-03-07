import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { PlanEditDialogComponent } from './releaseplanedit/releaseplanedit.component';
import { PlanDashboardComponent } from './plan-dashboard/plan-dashboard.component';
import { NodeDashboardComponent } from './nodedashboard/nodedashboard.component';
import { ProductDashboardComponent } from './product-dashboard/product-dashboard.component';
import { ProductEditDialogComponent } from './productedit/productedit.component';
import { AlertDialogModule } from '../alert-dialog/alert-dialog.module';
import { MilestoneLinkEditDialogComponent } from './milestonelink-edit/milestonelink-edit.component';
import { NodeEditDialogComponent } from './nodeedit/nodeedit.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { PlanListViewComponent } from './plan-dashboard/plan-list-view/plan-list-view.component';
import { PlanGraphViewComponent } from './plan-dashboard/plan-graph-view/plan-graph-view.component';
import { PlanReportsDialogComponent } from './plan-dashboard/plan-reports-dialog/plan-reports-dialog.component';

@NgModule({
  declarations: [
    ProductsComponent,
    PlanEditDialogComponent,
    PlanDashboardComponent,
    NodeDashboardComponent,
    ProductDashboardComponent,
    ProductEditDialogComponent,
    NodeEditDialogComponent,
    MilestoneLinkEditDialogComponent,
    PlanListViewComponent,
    PlanGraphViewComponent,
    PlanReportsDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    NgxGraphModule,
    ProductsRoutingModule,
    AlertDialogModule
  ],
  entryComponents: [
    PlanEditDialogComponent,
    ProductEditDialogComponent,
    NodeEditDialogComponent,
    PlanReportsDialogComponent
  ],
})
export class ProductsModule { }
