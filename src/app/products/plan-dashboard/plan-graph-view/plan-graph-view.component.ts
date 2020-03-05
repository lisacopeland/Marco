import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-plan-graph-view',
  templateUrl: './plan-graph-view.component.html',
  styleUrls: ['./plan-graph-view.component.scss']
})
export class PlanGraphViewComponent implements OnInit, OnChanges {
  @Input() planNodes: PlanNodeInterface;
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

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.redrawGraph();
  }

  redrawGraph() {
    // turn the planNodes into the nodes and edges of the graph
  }

  onNodeClick($event) {
    console.log('Im node ' + $event.label + 'and I was clicked!');

  }

  onLineClick($event) {
    console.log('I am a line between ' + $event.source + ' and ' + $event.target + ' and I was clicked!');
  }


}
