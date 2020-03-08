import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PlanNodeInterface } from '@shared/interfaces/node.interface';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { NodeService } from '@shared/services/node.service';

@Component({
  selector: 'app-plan-graph-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plan-graph-view.component.html',
  styleUrls: ['./plan-graph-view.component.scss']
})
export class PlanGraphViewComponent implements OnInit {
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
/*   nodes: Node[] = [
    {
      id: 'PROD002.PLAN004!M.NODE001',
      label: 'NODE001',
      data: {
        nodeType: 'Milestone', backgroundColor: '#99ccff' }
    },
    {
      id: 'PROD002.PLAN004!M.NODE002',
      label: 'NODE002',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    {
      id: 'PROD002.PLAN004!M.NODE003',
      label: 'NODE003',
      data: { nodeType: 'Milestone', backgroundColor: '#99ccff' }
    },
    {
      id: 'PROD002.PLAN004!M.NODE004',
      label: 'NODE004',
      data: { nodeType: 'Milestone', backgroundColor: '#99ccff' }
    },
    { id: 'PROD002.PLAN004!M.NODE005',
      label: 'NODE005',
      data: { nodeType: 'Milestone', backgroundColor: '#99ccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE006',
      label: 'NODE006',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    }]; */

    /*,
    { id: 'PROD002.PLAN004!T.NODE10B',
      label: 'NODE10B',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE10C',
      label: 'NODE10C',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE10D',
      label: 'NODE10D',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE10E',
      label: 'NODE10E',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE10F',
      label: 'NODE10F',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE10G',
      label: 'NODE10G',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE10H',
      label: 'NODE10H',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    },
    { id: 'PROD002.PLAN004!T.NODE10I',
      label: 'NODE10I',
      data: { nodeType: 'Task', backgroundColor: '#ffccff' }
    }
    ];
*/
/*   links: Edge[] = [
    { id: 'n1', source: 'PROD002.PLAN004!M.NODE002', target: 'PROD002.PLAN004!M.NODE003' },
    { id: 'n2', source: 'PROD002.PLAN004!M.NODE001', target: 'PROD002.PLAN004!M.NODE002' },
    { id: 'n3', source: 'PROD002.PLAN004!M.NODE003', target: 'PROD002.PLAN004!M.NODE004' },
    { id: 'n4', source: 'PROD002.PLAN004!M.NODE004', target: 'PROD002.PLAN004!M.NODE005' },
    { id: 'n5', source: 'PROD002.PLAN004!M.NODE005', target: 'PROD002.PLAN004!T.NODE006' }];
 */
    /*,
    { id: 'no4', source: 'PROD002.PLAN004!T.NODE10B', target: 'PROD002.PLAN004!T.NODE10C' },
    { id: 'no5', source: 'PROD002.PLAN004!T.NODE004', target: 'PROD002.PLAN004!T.NODE10D' },
    { id: 'no6', source: 'PROD002.PLAN004!T.NODE10D', target: 'PROD002.PLAN004!T.NODE10E' },
    { id: 'no7', source: 'PROD002.PLAN004!T.NODE003', target: 'PROD002.PLAN004!T.NODE10F' },
    { id: 'no8', source: 'PROD002.PLAN004!T.NODE10F', target: 'PROD002.PLAN004!T.NODE10G' },
    { id: 'no9', source: 'PROD002.PLAN004!T.NODE10G', target: 'PROD002.PLAN004!T.NODE10H' },
    { id: 'no10', source: 'PROD002.PLAN004!T.NODE10H', target: 'PROD002.PLAN004!T.NODE10I' }
  ]; */
/*   nodes: Node[] = [
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
  ]; */

/*   links: Edge[] = [
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
  ]; */

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
          nodeType: node.nodeType,
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
    console.log('newNodes is ' + JSON.stringify(newNodes));
    console.log('newLinks is ' + JSON.stringify(newLinks));
    // this.nodes = newNodes.slice();
    // this.links = newLinks.slice();
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
