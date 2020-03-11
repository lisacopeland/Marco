import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductsComponent } from './products.component';
import { ProductDashboardComponent } from './product-dashboard/product-dashboard.component';
import { PlanDashboardComponent } from './plan-dashboard/plan-dashboard.component';
import { PlanListViewComponent } from './plan-dashboard/plan-list-view/plan-list-view.component';
import { PlanGraphViewComponent } from './plan-dashboard/plan-graph-view/plan-graph-view.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'productdashboard', component: ProductDashboardComponent },
  { path: 'newdashboard', component: PlanDashboardComponent },
  { path: 'planlist', component: PlanListViewComponent },
  { path: 'plangraph', component: PlanGraphViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
