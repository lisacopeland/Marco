import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [];

/* const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'productdashboard', component: ProductDashboardComponent },
  { path: 'newdashboard', component: PlanDashboardComponent },
  { path: 'nodedashboard', component: NodeDashboardComponent }
]; */

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SidebarRoutingModule { }
