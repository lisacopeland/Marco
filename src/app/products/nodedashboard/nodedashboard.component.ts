import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanNodeInterface, PlanMilestoneInterface, PlanTaskInterface } from '@interfaces/node.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NodeService } from '@services/node.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-nodedashboard',
  templateUrl: './nodedashboard.component.html',
  styleUrls: ['./nodedashboard.component.scss']
})
export class NodeDashboardComponent implements OnInit {

  node: PlanNodeInterface;
  nodeId: string;
  selfLink: string;

  constructor(private route: ActivatedRoute,
              private nodeService: NodeService) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.nodeId = params.id;
        this.selfLink = params.selfLink;
        console.log('node id is ' + this.nodeId);
        if (this.nodeId) {
          this.nodeService.getNodeHttp(this.selfLink)
            .subscribe(node => {
              if (node.nodeType === 'Milestone') {
                this.node = node as PlanMilestoneInterface;
              } else {
                this.node = node as PlanTaskInterface;
              }

            });
        }
      });
  }

  onEdit() {

  }

  addLine() {

  }

  deleteLine() {

  }

  onDelete() {
    // For when the user wants to delete this note, show confirmation modal
  }
}
