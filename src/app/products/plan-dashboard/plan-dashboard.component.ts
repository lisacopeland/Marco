import { Component, OnInit } from '@angular/core';
import { ReleasePlanInterface } from '@shared/interfaces/releaseplan.interface';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NodeService } from '@shared/services/node.service';
import { MatDialog } from '@angular/material/dialog';
import { ReleasePlanService } from '@shared/services/releaseplan.service';
import { switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { PlanEditDialogComponent, PlanEditDataInterface } from '../releaseplanedit/releaseplanedit.component';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-plan-dashboard',
  templateUrl: './plan-dashboard.component.html',
  styleUrls: ['./plan-dashboard.component.scss']
})
export class PlanDashboardComponent implements OnInit {
  releasePlan: ReleasePlanInterface;
  releasePlanId: string;
  selfLink: string;
  nodes: PlanNodeInterface[];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private nodeService: NodeService,
              public dialog: MatDialog,
              private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.releasePlanId = params.id;
        this.selfLink = params.selfLink;  // The planLink from the parent record
        console.log('plan id is ' + this.releasePlanId);
        if (this.releasePlanId) {
          this.releasePlanService.getReleasePlanHttp(this.selfLink)
            .pipe(
              switchMap(releasePlan => {
                this.releasePlan = releasePlan;
                return this.nodeService.getNodesHttp(this.releasePlan.planNodeLink);
              }))
            .subscribe((data: any) => {
              this.nodes = data as PlanNodeInterface[];
              this.subscribeToLookup();
            }, error => {
              if (!environment.production) {
                console.log('got error getting data' + error);
              }
            });
        }
      });
  }

  subscribeToLookup() {
    this.nodeService.nodeLookup.subscribe(data => {
      this.nodes = data as PlanNodeInterface[];
    });
  }

  onEdit() {
    const editData: PlanEditDataInterface = {
      planLink: this.releasePlan.planNodeLink,
      selfLink: this.selfLink,
      releasePlan: this.releasePlan
    };
    const dialogRef = this.dialog.open(PlanEditDialogComponent, {
      width: '500px',
      data: editData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('the plan was updated');
        this.releasePlan = result;
      } else {
        console.log('the release plan was not updated');
      }
    });
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
      if (result === 'Yes') {
        console.log('result was yes');
        this.releasePlanService.delReleasePlan(this.releasePlan)
          .subscribe(() => {
            this.router.navigateByUrl('/products', { queryParams: { id: this.releasePlan.parentId } });
          });
      }
    });
  }

}
