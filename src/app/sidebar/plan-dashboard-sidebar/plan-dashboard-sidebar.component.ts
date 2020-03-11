import { Component, OnInit } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ReleasePlanService } from '@shared/services/releaseplan.service';
import { ReleasePlanInterface } from '@shared/interfaces/releaseplan.interface';

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 1000,
  hideDelay: 500,
  touchendHideDelay: 1000,
};

@Component({
  selector: 'app-plan-dashboard-sidebar',
  templateUrl: './plan-dashboard-sidebar.component.html',
  styleUrls: ['./plan-dashboard-sidebar.component.scss'],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }
  ]
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
