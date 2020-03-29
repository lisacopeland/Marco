import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild } from '@angular/core';
import { NodeInterface } from '@shared/interfaces/node.interface';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { NodeService } from '@shared/services/node.service';
import { NodeActionInterface } from '../plan-dashboard.component';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-plan-graph-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plan-graph-view.component.html',
  styleUrls: ['./plan-graph-view.component.scss']
})
export class PlanGraphViewComponent implements OnInit {
  @Output() nodeAction = new EventEmitter<NodeActionInterface>();

  onReady = true;
  milestoneBackground = '#99ccff';
  // milestoneText = '#ff0000';
  milestoneText = '#404040';
  linkPointBackground = '#80ffaa';
  linkPointText = '#404040';
  actionBackground = '#ff80ff';
  // nodeText = '#0000cc';
  actionText = '#404040';
  lineColor = '#333333';
  planNodes: NodeInterface[];
  curve: any = shape.curveLinear;
  layout = 'dagre';
  draggingEnabled = true;
  panningEnabled = true;
  zoomEnabled = false;

  zoomSpeed = 0.1;
  minZoomLevel = 0.1;
  maxZoomLevel = 4.0;
  panOnZoom = true;

  autoZoom = false;
  autoCenter = false;

  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<boolean> = new Subject();

  nodes: Node[] = [];
  links: Edge[] = [];

  constructor(private nodeService: NodeService) { }

  ngOnInit(): void {
    this.nodeService.nodeLookup
      .subscribe(data => {
        if (data.length) {
          this.planNodes = data;
          this.redrawGraph();
        }
      });
  }

  onAddPlanNode() {
    // Send a message to the dashboard to add a node
    this.nodeAction.emit({
      action: 'add',
      planNode: null,
      targetNode: null
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

  redrawGraph() {
    // turn the planNodes into the nodes and edges of the graph
    const newNodes: Node[] = [];
    const newLinks: Edge[] = [];
    let edgeCounter = 0;
    this.planNodes.forEach(node => {
      newNodes.push({
        id: node.id,
        label: node.name,
        data: {
          node
        }
      });
      if (node.predecessors) {
        node.predecessors.forEach(predecessor => {
          newLinks.push({
            id: 'edge' + edgeCounter.toString(),
            source: predecessor,
            target: node.id
          });
          edgeCounter++;
        });
      }
    });
    this.nodes = newNodes;
    this.links = newLinks;
  }
}
