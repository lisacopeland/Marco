import { Component, OnInit } from '@angular/core';
import { ReleasePlanInterface } from '@shared/interfaces/releaseplan.interface';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { ActivatedRoute } from '@angular/router';
import { NodeService } from '@shared/services/node.service';
import { MatDialog } from '@angular/material/dialog';
import { ReleasePlanService } from '@shared/services/releaseplan.service';
import { switchMap } from 'rxjs/operators';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';

import { environment } from '@environments/environment';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-plan-dashboard',
  templateUrl: './plan-dashboard.component.html',
  styleUrls: ['./plan-dashboard.component.scss']
})
export class PlanDashboardComponent implements OnInit {
  releasePlan: ReleasePlanInterface;
  releasePlanId: string;
  selfLink: string;
  // nodes: PlanNodeInterface[];

  curve: any = shape.curveLinear;
  layout = 'dagre';
  draggingEnabled = true;
  panningEnabled = true;
  zoomEnabled = true;

  zoomSpeed = 0.1;
  minZoomLevel = 0.1;
  maxZoomLevel = 4.0;
  panOnZoom = true;

  autoZoom = false;
  autoCenter = false;

  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<boolean> = new Subject();

  nodes: Node[] = [
    {
      id: '1',
      label: 'Milestone A',
      data: {
        nodeType: 'Milestone',
        backgroundColor: 'blue',
        color: 'white'
      }
    },
    {
      id: '2',
      label: 'Task B',
      data: {
        nodeType: 'Task',
        backgroundColor: 'pink',
        color: 'black'
      }

    },
    {
      id: '3',
      label: 'Task C',
      data: {
        nodeType: 'Task',
        backgroundColor: 'pink',
        color: 'black'
      }

    },
    {
      id: '4',
      label: 'Task D',
      data: {
        nodeType: 'Task',
        backgroundColor: 'pink',
        color: 'black'
      }

    },
    {
      id: '5',
      label: 'Task Elephant',
      data: {
        nodeType: 'Task',
        backgroundColor: 'pink',
        color: 'black'
      }

    },
    {
      id: '6',
      label: 'Milestone F',
      data: {
        nodeType: 'Milestone',
        backgroundColor: 'blue',
        color: 'white'
      }

    }
  ];

  links: Edge[] = [
    {
      id: 'a',
      source: '1',
      target: '2',
      label: 'Between 1 and 2'
    }, {
      id: 'b',
      source: '1',
      target: '3'
    }, {
      id: 'c',
      source: '3',
      target: '4',
      label: 'Between 3 & 4'
    }, {
      id: 'd',
      source: '3',
      target: '5'
    }, {
      id: 'e',
      source: '4',
      target: '5'
    }, {
      id: 'f',
      source: '2',
      target: '6'
    }
  ];


  constructor(private route: ActivatedRoute,
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
              // this.nodes = data as PlanNodeInterface[];
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
      // this.nodes = data as PlanNodeInterface[];
    });
  }

  createGraph() {
    // build the the graph
  }

  onNodeClick($event) {
    console.log('Im node ' + $event.label + 'and I was clicked!');

  }

  onLineClick($event) {
    console.log('I am a line between ' + $event.source + ' and ' + $event.target + ' and I was clicked!');
  }

}
