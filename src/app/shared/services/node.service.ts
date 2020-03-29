import { Injectable } from '@angular/core';
import { NodeInterface } from '../interfaces/node.interface';
import { environment } from '@environments/environment';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, take } from 'rxjs/operators';
import { DatabaseInterface } from '@shared/interfaces/database.interface';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  nodes: NodeInterface[] = [];
  apiUrl = environment.apiUrl;
  private nodeSource = new BehaviorSubject<NodeInterface[]>(this.nodes);
  nodeLookup = this.nodeSource.asObservable();

  constructor(private http: HttpClient) { }

  cacheNodes(nodes: NodeInterface[]) {
    this.nodes = nodes as NodeInterface[];
    this.nodeSource.next(this.nodes.slice());
  }

  addNodeCache(node: NodeInterface) {
    this.nodes.push(node);
    this.nodeSource.next(this.nodes.slice());
  }

  editNodeCache(node: NodeInterface) {
    const idx = this.nodes.findIndex(x => x.id === node.id);
    if (idx !== -1) {
      this.nodes[idx] = node;
      this.nodeSource.next(this.nodes.slice());
    }
  }

  delNodeCache(node: NodeInterface) {
    // First loop thru all nodes and remove this one from
    // the predecessor list of all nodes
    const successorNodes = this.nodes.filter(targetNode => {
      return (targetNode.predecessors.find(x => x === node.id) !== undefined);
    });
    successorNodes.forEach(targetNode => {
      const idx1 = targetNode.predecessors.findIndex(x => x === node.id);
      targetNode.predecessors.splice(idx1, 1);
    });
    // Now remove this node from the list
    const idx = this.nodes.findIndex(x => x.id === node.id);
    if (idx !== -1) {
      this.nodes.splice(idx, 1);
      this.nodeSource.next(this.nodes);
    }
  }

  delLineCache(sourceNode: NodeInterface, targetNode: NodeInterface) {
    // TargetNode should have sourceNode as a predecessor
    const idx = this.nodes.findIndex(x => x.id === targetNode.id);
    const editNode = this.nodes[idx];
    const idx1 = editNode.predecessors.findIndex(x => x === sourceNode.id);
    targetNode.predecessors.splice(idx1, 1);
    this.nodeSource.next(this.nodes);
  }

  getNodeById(id: string) {
    return this.nodes.find(x => x.id === id);
  }

  // Returns true if the name is taken, false if otherwise
  isNameTaken(name: string): Observable<boolean | null> {
    const result = (this.nodes.find(x => x.name === name.toUpperCase()) !== undefined);
    return of(result);
  }

}
