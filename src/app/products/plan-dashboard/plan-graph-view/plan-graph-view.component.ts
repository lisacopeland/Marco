import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
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
  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  onReady = true;
  taskBackgroundColor = '#ffccff';
  milestoneBackgroundColor = '#99ccff';
  milestoneLinkBackgroundColor = '#99ffcc';
  planNodes: PlanNodeInterface[];
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

  onEditNode(node: PlanNodeInterface) {
    this.nodeAction.emit({
      action: 'edit',
      planNode: node,
      targetNode: null
    });
  }

  onDeleteNode(node: PlanNodeInterface) {
    this.nodeAction.emit({
      action: 'delete',
      planNode: node,
      targetNode: null
    });
  }

  onAddLine(node: PlanNodeInterface, fromHere: string) {
    this.nodeAction.emit({
      action: fromHere,
      planNode: node,
      targetNode: null
    });
  }

  onDelLine(sourceNode: PlanNodeInterface, targetNode: PlanNodeInterface) {
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
      console.log('current node : ' + JSON.stringify(node));
      let backgroundColor = '';
      if (node.nodeType === 'Milestone') {
        backgroundColor = this.milestoneBackgroundColor;
      } else if (node.nodeType === 'Task') {
        backgroundColor = this.taskBackgroundColor;
      } else if (node.nodeType === 'MilestoneLink') {
        backgroundColor = this.milestoneLinkBackgroundColor;
      } else {
        backgroundColor = '#ffffff';
      }
      newNodes.push({
        id: node.id,
        label: node.name,
        data: {
          node,
          backgroundColor
        }
      });
      if ((node.predecessors !== undefined) && (node.predecessors.length)) {
        node.predecessors.forEach(predecessor => {
          newLinks.push({
            id: 'no' + edgeCounter.toString(),
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

  onNodeClick($event) {
    console.log('Im node ' + $event.label + 'and I was clicked!');

  }

  onLineClick($event) {
    console.log('I am a line between ' + $event.source + ' and ' + $event.target + ' and I was clicked!');
  }


}
