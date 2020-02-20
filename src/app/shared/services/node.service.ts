import { Injectable } from '@angular/core';
import { NodeInterface } from '../interfaces/node.interface';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  nodes: NodeInterface[] = [
    {
      name: 'Node1',
      id: '1',
      predecessors: [],
      releasePlanId: '1'
    },
    {
      name: 'Node2',
      id: '2',
      predecessors: [
        '1'
      ],
      releasePlanId: '1'
    }
  ];
  constructor() { }

  getNodes() {
    return this.nodes.slice();
  }

  getNodeById(id: string) {
    return this.nodes.find(x => x.id === id);
  }

  addNode(newNode: NodeInterface) {
    // Check if it already exists
    if (this.nodes.findIndex(x => x.id === newNode.id) === -1) {
      this.nodes.push(newNode);
    }
  }

  delNode(nodeId: string) {
    const idx = this.nodes.findIndex(x => x.id === nodeId);

    if (idx !== -1) {
      this.nodes.splice(idx, 1);
    }
  }

  editNode(newNode) {
    const idx = this.nodes.findIndex(x => x.id === newNode.id);
    this.nodes[idx] = newNode;
  }
}
