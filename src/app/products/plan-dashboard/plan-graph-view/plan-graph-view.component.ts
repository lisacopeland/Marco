import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { NodeInterface } from '@shared/interfaces/node.interface';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { NodeService } from '@shared/services/node.service';
import { NodeActionInterface } from '../plan-dashboard.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-plan-graph-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plan-graph-view.component.html',
  styleUrls: ['./plan-graph-view.component.scss']
})
export class PlanGraphViewComponent implements OnInit, OnDestroy {
  // @Output() nodeAction = new EventEmitter<NodeActionInterface>();
  @Output() nodeAction = new EventEmitter<any>();

  unsubscribe$: Subject<void> = new Subject<void>();
  onReady = true;
  //  milestoneBackground = '#e9433f';
  milestoneBackground = '#bfbfbf';
  // milestoneText = '#ff0000';
  milestoneText = '#404040';
  linkPointBackground = '#bfbfbf';
  linkPointText = '#404040';
  linkPointDef = '0 50, 75 100, 150 50, 75 0';
  actionBackground = '#bfbfbf';
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
      .pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
        if (data.length) {
          this.planNodes = data;
          console.log('there are now # nodes ' + this.planNodes.length);
          this.redrawGraph();
        }
      });
  }

  onAddPlanNode(nodeType) {
    // Send a message to the dashboard to add a node
    this.nodeAction.emit({
      action: 'add',
      nodeType
    });
  }

  onEditNode(node: NodeInterface) {
    this.nodeAction.emit({
      action: 'edit',
      nodeType: node.nodeType,
      planNode: node
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

  redrawGraph() {
    // turn the planNodes into the nodes and edges of the graph
    const newNodes: Node[] = [];
    const newLinks: Edge[] = [];
    let edgeCounter = 1;
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
    console.log('new nodes:');
    newNodes.forEach(x => {
      console.log(x.id);
      if (x.data.predecessors) {
        console.log('Predecessors: ' + x.data.predecessors);
      }
    });
    console.log('new links:');
    newLinks.forEach(l => {
      console.log('source: ' + l.source + ' target: ' + l.target);
    });
    this.nodes = newNodes;
    this.links = newLinks;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
