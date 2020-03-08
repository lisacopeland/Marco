import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MainSidebarComponent } from './main-sidebar/main-sidebar.component';
import { SidebarRoutingModule } from './sidebar-routing.module';
import { ProductsSidebarComponent } from './products-sidebar/products-sidebar.component';
import { RouterModule } from '@angular/router';
import { PlanDashboardSidebarComponent } from './plan-dashboard-sidebar/plan-dashboard-sidebar.component';
import { ProductSidebarComponent } from './product-sidebar/product-sidebar.component';

@NgModule({
  declarations: [
    MainSidebarComponent,
    ProductsSidebarComponent,
    PlanDashboardSidebarComponent,
    ProductSidebarComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    MainSidebarComponent,
    ProductsSidebarComponent,
    PlanDashboardSidebarComponent
  ],
  entryComponents: [],
})
export class SidebarModule { }
