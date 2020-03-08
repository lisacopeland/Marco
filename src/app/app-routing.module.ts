import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { MainSidebarComponent } from './sidebar/main-sidebar/main-sidebar.component';
import { ProductsSidebarComponent } from './sidebar/products-sidebar/products-sidebar.component';
import { PlanDashboardSidebarComponent } from './sidebar/plan-dashboard-sidebar/plan-dashboard-sidebar.component';
import { ProductSidebarComponent } from './sidebar/product-sidebar/product-sidebar.component';

const routes: Routes = [
{ path: '', redirectTo: '/products', pathMatch: 'full' },
{ path: '', component: MainSidebarComponent, outlet: 'sidebar'},
{ path: 'about', component: AboutComponent },
{ path: 'deployments', loadChildren: () => import('./deployments/deployments.module').then(m => m.DeploymentsModule) },
{ path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) },
{ path: 'mainsidebar', component: MainSidebarComponent, outlet: 'sidebar' },
{ path: 'productssidebar', component: ProductsSidebarComponent, outlet: 'sidebar'},
{ path: 'productsidebar', component: ProductSidebarComponent, outlet: 'sidebar' },
{ path: 'plandashboardsidebar', component: PlanDashboardSidebarComponent, outlet: 'sidebar'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
