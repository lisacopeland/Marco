import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
{ path: '', redirectTo: '/products', pathMatch: 'full' },
{ path: 'about', component: AboutComponent },
{ path: 'deployments', loadChildren: () => import('./deployments/deployments.module').then(m => m.DeploymentsModule) },
{ path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
