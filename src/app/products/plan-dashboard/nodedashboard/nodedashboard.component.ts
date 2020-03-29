import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeInterface, MilestoneNodeInterface, ActionNodeInterface, LinkPointNodeInterface } from '@interfaces/node.interface';
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
  predecessors: NodeInterface[];
  successors: NodeInterface[];
  timerTrigger: NodeInterface = null;
  milestone: MilestoneNodeInterface;
  action: ActionNodeInterface;
  linkPoint: LinkPointNodeInterface;

  constructor(private nodeService: NodeService) { }

  ngOnInit(): void {
    this.predecessors = this.nodeService.getPredecessors(this.node);
    this.successors = this.nodeService.getSuccessors(this.node);
    if (this.node.timerTrigger) {
      this.timerTrigger = this.nodeService.getNodeById(this.node.timerTrigger);
    }
    if (this.node.nodeType === 'Action') {
      this.action = this.node as ActionNodeInterface;
    } else if (this.node.nodeType === 'Milestone') {
      this.milestone = this.node as MilestoneNodeInterface;
    } else if (this.node.nodeType === 'LinkPoint') {
      this.linkPoint = this.node as LinkPointNodeInterface;
    }
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
    const sourceNode = this.nodeService.getNodeById(sourceNodeId);
    const targetNode = this.nodeService.getNodeById(targetNodeId);
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
