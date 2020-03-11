import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReleasePlanService } from '@shared/services/releaseplan.service';
import { ReleasePlanInterface } from '@shared/interfaces/releaseplan.interface';

@Component({
  selector: 'app-plan-dashboard-sidebar',
  templateUrl: './plan-dashboard-sidebar.component.html',
  styleUrls: ['./plan-dashboard-sidebar.component.scss']
})
export class PlanDashboardSidebarComponent implements OnInit {

  releasePlan: ReleasePlanInterface;
  constructor(private router: Router,
              private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    this.releasePlanService.currentPlanChanged
      .subscribe(plan => {
        this.releasePlan = plan as ReleasePlanInterface;
      });
  }

  onReturnToProduct() {
    this.router.navigate(
      [{
        outlets:
          { primary: 'products/productdashboard',
            sidebar: 'productsidebar' } }],
          { queryParams: { id: this.releasePlan.parentId } });
  }

}
