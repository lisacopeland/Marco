import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeInterface, MilestoneNodeInterface, ActionNodeInterface } from '@interfaces/node.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NodeService } from '@services/node.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NodeActionInterface } from '../plan-dashboard.component';

@Component({
  selector: 'app-nodedashboard',
  templateUrl: './nodedashboard.component.html',
  styleUrls: ['./nodedashboard.component.scss']
})
export class NodeDashboardComponent implements OnInit {
  @Input() node: NodeInterface;
  @Output() nodeAction = new EventEmitter<NodeActionInterface>();
  planNodes: NodeInterface[];
  constructor(private nodeService: NodeService) { }

  ngOnInit(): void {
    this.nodeService.nodeLookup
      .subscribe(data => {
        if (data.length) {
          this.planNodes = data;
        }
      });
  }

  onEditNode(node: NodeInterface) {
    this.nodeAction.emit({
      action: 'edit',
      planNode: node,
      targetNode: null
    });
  }

  onDeleteNode(node: NodeInterface) {
    this.nodeAction.emit({
      action: 'delete',
      planNode: node,
      targetNode: null
    });
  }

  onAddLine(node: NodeInterface, fromHere: string) {
    this.nodeAction.emit({
      action: fromHere,
      planNode: node,
      targetNode: null
    });
  }

  onDelLine(sourceNodeId: string, targetNodeId: string) {
    const sourceNode = this.planNodes.find(x => x.id === sourceNodeId);
    const targetNode = this.planNodes.find(x => x.id === targetNodeId);
    this.nodeAction.emit({
      action: 'deleteLine',
      planNode: sourceNode,
      targetNode
    });
  }

  onSwitchView(view) {
    this.nodeAction.emit({
      action: view,
      planNode: null,
      targetNode: null
    });

  }
}
