import { Injectable } from '@angular/core';
import { PlanNodeInterface } from '../interfaces/node.interface';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  apiUrl = environment.apiUrl;

  nodes: PlanNodeInterface[] = [
    {
      planNodeId: 'product1.plan1.node1',
      parentId: 'product1.plan1',
      planNodeName: 'node1',
      description: 'Description of Node1',
      nodeType: 'Milestone',
      predecessors: [],
      delayedStartTimerDurationMins: 0,
      delayedStartTimerTrigger: '',
      selfLink: this.apiUrl + '/product/product1/plans/plan1/nodes/node1'
    },
    {
      planNodeId: 'product1.plan1.node2',
      parentId: 'product1.plan1',
      planNodeName: 'node2',
      description: 'Description of Node2',
      nodeType: 'Milestone',
      predecessors: [],
      delayedStartTimerDurationMins: 0,
      delayedStartTimerTrigger: '',
      selfLink: this.apiUrl + '/product/product1/plans/plan1/nodes/node2'
    },
    {
      planNodeId: 'product1.plan2.node1',
      parentId: 'product1.plan2',
      planNodeName: 'node1',
      description: 'Description of Node1 for plan2',
      nodeType: 'Milestone',
      predecessors: [],
      delayedStartTimerDurationMins: 0,
      delayedStartTimerTrigger: '',
      selfLink: this.apiUrl + '/product/product1/plans/plan2/nodes/node1'
    }
  ];
  constructor() { }

  getNodes(ParentId: string) {
    return this.nodes.filter(x => x.parentId === ParentId);
  }

  getNodeById(id: string) {
    return this.nodes.find(x => x.planNodeId === id);
  }

  addNode(newNode: PlanNodeInterface) {
    // Check if it already exists
    if (this.nodes.findIndex(x => x.planNodeId === newNode.planNodeId) === -1) {
      newNode.planNodeId = newNode.parentId + ':' + newNode.planNodeName;
      this.nodes.push(newNode);
    }
  }

  delNode(nodeId: string) {
    const idx = this.nodes.findIndex(x => x.planNodeId === nodeId);

    if (idx !== -1) {
      this.nodes.splice(idx, 1);
    }
  }

  editNode(newNode) {
    const idx = this.nodes.findIndex(x => x.planNodeId === newNode.id);
    this.nodes[idx] = newNode;
  }
}
