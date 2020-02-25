import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanNodeInterface } from '@interfaces/node.interface';
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

  constructor(private route: ActivatedRoute,
              private nodeService: NodeService) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.nodeId = params.id;
        console.log('node id is ' + this.nodeId);
        if (this.nodeId) {
          this.node = this.nodeService.getNodeById(this.nodeId);
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
