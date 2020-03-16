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
import { PlanReportsDialogComponent } from './plan-reports-dialog/plan-reports-dialog.component';
import { NodeEditDataInterface, NodeEditDialogComponent } from '../nodeedit/nodeedit.component';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NodeActionInterface {
  action: string;
  planNode: PlanNodeInterface|null;
}

@Component({
  selector: 'app-plan-dashboard',
  templateUrl: './plan-dashboard.component.html',
  styleUrls: ['./plan-dashboard.component.scss']
})
export class PlanDashboardComponent implements OnInit {
  releasePlan: ReleasePlanInterface;
  releasePlanId: string;
  masterViewLink: string;
  workingViewLink: string;
  version = 'master';
  nodeView = 'graph';
  planDirty = false;
  versionSelectString = 'Switch to Edit';
  hasReports = false;
  selfLink: string;
  nodes: PlanNodeInterface[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private nodeService: NodeService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    // TODO: You need to keep sidebar in sync with dashboard re: current view
    this.route.queryParams
      .subscribe(params => {
        this.releasePlanId = params.id;
        this.masterViewLink = params.masterViewLink;  // The planLink from the parent record
        console.log('link is ' + this.masterViewLink);
        if (this.releasePlanId) {
          this.getReleasePlan(this.masterViewLink);
        }
      });
  }

  getReleasePlan(link: string) {
    console.log('getting releaseplans using ' + link);
    this.releasePlanService.getReleasePlan(link)
      .subscribe((data: any) => {
        if (this.version === 'master') {
          this.version = 'master';
          this.versionSelectString = 'Switch to Working Copy';
          this.planDirty = false;
        } else {
          this.version = 'working';
          this.versionSelectString = 'Switch to Master';
          this.planDirty = false;
        }
        this.releasePlan = data as ReleasePlanInterface;
        if (this.releasePlan.verificationReports !== undefined) {
          this.hasReports = (this.releasePlan.verificationReports.length !== 0);
        }
        this.workingViewLink = this.releasePlan.workingViewLink;
        this.nodes = this.releasePlan.nodes;
        this.nodeService.cacheNodes(this.nodes);
        this.subscribeToLookup();
      }, error => {
        if (!environment.production) {
          console.log('got error getting data' + error);
        }
      });
  }

  // This is how you are going to know that the data has changed
  subscribeToLookup() {
    this.nodeService.nodeLookup.subscribe(data => {
      this.nodes = data as PlanNodeInterface[];
    });
  }

  onChangeView() {
    if (this.nodeView === 'list') {
      this.nodeView = 'graph';
    } else {
      this.nodeView = 'list';
    }
  }

  onChangeVersion($event) {
    if (this.version === 'master') {
      this.version = 'working';
      this.getReleasePlan(this.workingViewLink);
    } else {
      // First see if the user has made changes
      if (this.planDirty) {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
          width: '400px',
          data: {
            header: 'You have made changes',
            cancelTooltip: 'Return to dashboard',
            message: 'Are you sure you want to switch to master?',
            buttons: ['Yes', 'No']
          }
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'Yes') {
            console.log('result was yes');
            this.version = 'master';
            this.getReleasePlan(this.masterViewLink);
          }
        });
      } else {
        this.version = 'master';
        this.getReleasePlan(this.masterViewLink);
      }
    }

  }

  onNodeAction($event: NodeActionInterface) {
    if (this.version === 'master') {
      this.snackBar.open('Switch to working copy to edit nodes', '', {
        duration: 2000,
      });
      return;
    }
    if (($event.action === 'add') || ($event.action === 'edit')) {
      const editData: NodeEditDataInterface = {
        parentId: this.releasePlan.id,
        node: ($event.action === 'edit') ? $event.planNode : null
      };
      const dialogRef = this.dialog.open(NodeEditDialogComponent, {
        width: '500px',
        data: editData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('a planNode was edited or added');
          this.planDirty = true;
          if ($event.action === 'add') {
            this.nodeService.addNodeCache(result);
          } else if ($event.action === 'edit') {
            this.nodeService.editNodeCache(result);
          }
        } else {
          console.log('dialog was cancelled');
        }
      });
    } else if ($event.action === 'delete') {
      this.nodeService.delNodeCache($event.planNode);
      this.planDirty = true;
    }
  }

  onEdit() {
    // Only available in working mode, allows the user to edit the "plan details",
    // if the user changes them it puts the dashboard in "dirty" mode
    if (this.version === 'master') {
      this.snackBar.open('Switch to working copy to edit the plan details', '', {
        duration: 2000,
      });
      return;
    }
    const editData: PlanEditDataInterface = {
      planLink: this.releasePlan.selfLink,
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
        this.planDirty = true;
      } else {
        console.log('the release plan was not updated');
      }
    });
  }

  onReset() {
    // Throws away all the changes in the working copy so it looks just like
    // master, changes the view to Master
  }

  onSave() {
    if (!this.planDirty) {
      this.snackBar.open('You have no changes to save.', '', {
        duration: 2000,
      });
      return;
    }

    // Saves the working copy as it has been changed during this editing session,
    // regardless of whether there are verification reports
  }

  onRefresh() {
    // Only available while editing, throws away current changes in this editing
    // session and restores the data on the screen to the current working copy
    if (this.version === 'master') {
      this.snackBar.open('There are no changes to discard', '', {
        duration: 2000,
      });
      return;
    }

  }

}
