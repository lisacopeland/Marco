import { Component, OnInit } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ReleasePlanService } from '@shared/services/releaseplan.service';
import { ReleasePlanInterface } from '@shared/interfaces/releaseplan.interface';
import { PlanEditDataInterface, PlanEditDialogComponent } from 'src/app/products/releaseplanedit/releaseplanedit.component';
import { PlanReportsDialogComponent } from 'src/app/products/plan-dashboard/plan-reports-dialog/plan-reports-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';

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
              public dialog: MatDialog,
              private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    this.releasePlanService.currentPlanChanged
      .subscribe(plan => {
        this.releasePlan = plan as ReleasePlanInterface;
      });
  }

  onShowReports() {
    const dialogRef = this.dialog.open(PlanReportsDialogComponent, {
      data: this.releasePlan,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  onVerify() {
    // Only available in working mode, calls the verify link to see if the plan is
    // verified. If it is not, then it will show the link so that the user can see
    // the current reports. What am I going to get back?
  }

  onCommit() {
    // Only available in working mode, this calls the commit link - internally this
    // will verify and if it passes it will commit, the Master will now be the
    // current working copy, and change the view to master. If the working copy does
    // not verify, the view will stay in working mode and the reports link will show.
  }

  onDelete() {

    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      data: {
        header: 'Delete Release Plan',
        cancelTooltip: 'Return to dashboard',
        message: 'All nodes will be deleted. Are you sure you want to delete this release plan?',
        buttons: ['Yes', 'No']
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
/*       if (result === 'Yes') {
        console.log('result was yes');
        this.releasePlanService.delReleasePlan(this.releasePlan)
          .subscribe(() => {
            this.router.navigateByUrl('/products', { queryParams: { id: this.releasePlan.parentId } });
          });
      } */
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
