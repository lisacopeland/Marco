import { Component, OnInit } from '@angular/core';
import { ActionSequenceTemplateInterface } from '@shared/interfaces/actionsequencetemplate.interface';
import { NodeInterface } from '@shared/interfaces/node.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NodeService } from '@shared/services/node.service';
import { MatDialog } from '@angular/material/dialog';
import { ActionSequenceTemplateService } from '@shared/services/actionsequencetemplate.service';
import { switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { PlanEditDialogComponent, PlanEditDataInterface } from '../releaseplanedit/releaseplanedit.component';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';
import { PlanReportsDialogComponent } from './plan-reports-dialog/plan-reports-dialog.component';
import { NodeEditDataInterface, NodeEditDialogComponent } from './nodeedit/nodeedit.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanLineEditDialogData, PlanLineDialogComponent } from './plan-line-dialog/plan-line-dialog.component';

export interface NodeActionInterface {
  action: string;
  planNode: NodeInterface|null;
  targetNode: NodeInterface|null;
}

@Component({
  selector: 'app-plan-dashboard',
  templateUrl: './plan-dashboard.component.html',
  styleUrls: ['./plan-dashboard.component.scss']
})
export class PlanDashboardComponent implements OnInit {
  actionSequenceTemplate: ActionSequenceTemplateInterface;
  actionSequenceTemplateId: string;
  committedLink: string;
  workingLink: string;
  version = 'master';
  nodeView = 'graph';
  planDirty = false;
  versionSelectString = 'Switch to Edit';
  hasReports = false;
  selfLink: string;
  currentNode: NodeInterface;
  nodes: NodeInterface[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private nodeService: NodeService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private actionSequenceTemplateService: ActionSequenceTemplateService) { }

  ngOnInit(): void {
    // TODO: You need to keep sidebar in sync with dashboard re: current view
    this.route.queryParams
      .subscribe(params => {
        this.actionSequenceTemplateId = params.id;
        this.committedLink = params.committedLink;  // The planLink from the parent record
        console.log('link is ' + this.committedLink);
        if (this.actionSequenceTemplateId) {
          this.getReleasePlan(this.committedLink);
        }
      });
  }

  getReleasePlan(link: string) {
    console.log('getting releaseplans using ' + link);
    this.actionSequenceTemplateService.getActionSequenceTemplate(link)
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
        this.actionSequenceTemplate = data as ActionSequenceTemplateInterface;
        // this.workingLink = this.actionSequenceTemplate.workingLink;
        this.workingLink = this.actionSequenceTemplate.committedLink;
        this.nodes = this.actionSequenceTemplate.nodes;
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
      this.nodes = data as NodeInterface[];
    });
  }

  // If you click the change button and the view is graph, change to list
  // If you are on list view then change to graph view
  // If you are on dashboard then switch to list view
  onChangeView() {
    if (this.nodeView === 'graph') {
      this.nodeView = 'list';
    } else if (this.nodeView === 'list') {
      this.nodeView = 'graph';
    } else {
      this.nodeView = 'list';
    }
  }

  onChangeVersion($event) {
    if (this.version === 'master') {
      this.version = 'working';
      this.getReleasePlan(this.workingLink);
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
            this.version = 'master';
            this.getReleasePlan(this.committedLink);
          }
        });
      } else {
        this.version = 'master';
        this.getReleasePlan(this.committedLink);
      }
    }

  }

  // If either the plan-list-view or graph-view wants to modify a node
  // It emits an event and is handled here
  onNodeAction($event: NodeActionInterface) {
    if (this.version === 'master') {
      this.snackBar.open('Switch to working copy to edit nodes', '', {
        duration: 2000,
      });
      return;
    }
    // User wants to add or edit an existing node
    if (($event.action === 'add') || ($event.action === 'edit')) {
      const editData: NodeEditDataInterface = {
        parentId: this.actionSequenceTemplate.id,
        node: ($event.action === 'edit') ? $event.planNode : null
      };
      const dialogRef = this.dialog.open(NodeEditDialogComponent, {
        width: '500px',
        data: editData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.planDirty = true;
          if ($event.action === 'add') {
            this.nodeService.addNodeCache(result);
          } else if ($event.action === 'edit') {
            this.nodeService.editNodeCache(result);
          }
        }
      });
    } else if (($event.action === 'from') || ($event.action === 'to')) {
      const editData: PlanLineEditDialogData = {
        node: $event.planNode,
        direction: $event.action
      };
      const dialogRef = this.dialog.open(PlanLineDialogComponent, {
        width: '500px',
        data: editData
      });
      dialogRef.afterClosed().subscribe(result => {
        // The result is the node that had a predecessor added to it,
        // save in the cache
        if (result) {
          console.log('a plan line was added');
          this.planDirty = true;
          this.nodeService.editNodeCache(result);
        } else {
          console.log('dialog was cancelled');
        }
      });
    } else if ($event.action === 'deleteLine') {
      this.nodeService.delLineCache($event.planNode, $event.targetNode);
      this.planDirty = true;
    } else if ($event.action === 'delete') {
      this.nodeService.delNodeCache($event.planNode);
      this.planDirty = true;
    } else if ($event.action === 'dashboard') {
      this.currentNode = $event.planNode;
      this.nodeView = 'dashboard';
    } else if ($event.action === 'list') {
      this.nodeView = 'list';
    } else if ($event.action === 'graph') {
      this.nodeView = 'graph';
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
      planLink: this.actionSequenceTemplate.selfLink,
      actionSequenceTemplate: this.actionSequenceTemplate
    };
    const dialogRef = this.dialog.open(PlanEditDialogComponent, {
      width: '500px',
      data: editData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actionSequenceTemplate = result;
        this.planDirty = true;
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
    console.log(this.actionSequenceTemplate);
    this.actionSequenceTemplateService.saveWorkingTemplate(this.actionSequenceTemplate)
      .subscribe(data => {
        // nothing should change
        console.log(data);
      });
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
