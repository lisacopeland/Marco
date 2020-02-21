import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SummaryComponent } from './summary/summary.component';
import { DetailComponent } from './detail/detail.component';
import { AboutComponent } from './about/about.component';
import { NodeDashboardComponent } from './nodedetail/nodedetail.component';


const routes: Routes = [
{ path: '', redirectTo: '/summary', pathMatch: 'full' },
{ path: 'summary', component: SummaryComponent },
{ path: 'detail/:id', component: DetailComponent },
{ path: 'detail', component: DetailComponent },
{ path: 'nodedetail/:id', component: NodeDashboardComponent },
{ path: 'about', component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
