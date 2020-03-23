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

  getNodesHttp(nodeLink: string) {
    interface GetResponse {
      nodes: NodeInterface[];
    }

    const url = this.apiUrl + '/' + nodeLink;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    return this.http
      .get<GetResponse>(url, httpOptions)
      .pipe(
        map(data => {
          this.nodes = data.nodes;
          this.nodeSource.next(this.nodes);
          return this.nodes.slice();
        }),
        catchError(this.handleError)
      );
  }

  getNodeSource(nodeLink: string) {
    return this.nodeSource
      .pipe(
        map(data => {
          if (Object.keys(data).length === 0) {
            this.getNodesHttp(nodeLink)
              .pipe(
                take(1)
              ).subscribe();
          }
          return data;
        })
      );
  }

  getNodeHttp(selfLink: string) {
    const url = this.apiUrl + '/' + selfLink;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    return this.http
      .get<NodeInterface>(url, httpOptions)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(this.handleError)
      );
  }

  getNodeById(id: string) {
    return this.nodes.find(x => x.id === id);
  }

  // Returns true if the name is taken, false if otherwise
  isNameTaken(name: string): Observable<boolean | null> {
    const result = (this.nodes.find(x => x.name === name.toUpperCase()) !== undefined);
    return of(result);
  }

  addNodeHTTP(nodeLink: string, node: NodeInterface) {

    const url = environment.apiUrl + '/' + nodeLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const body = JSON.stringify(node);
    return this.http
      .post<NodeInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          this.nodes.push(node);
          this.nodeSource.next(this.nodes);
          return data;
        }),
        catchError(this.handleError)
      );
  }

  delNodeHTTP(node: NodeInterface) {

    // TODO: If we ever use this we need to be sure to take
    // care of predecessors
    const url = environment.apiUrl + '/' + node.selfLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .delete<NodeInterface>(url, httpOptions)
      .pipe(
        map(data => {
          const idx = this.nodes.findIndex(x => x.id === node.id);
          if (idx !== -1) {
            this.nodes.splice(idx, 1);
            this.nodeSource.next(this.nodes);
          }
          return data;
        }),
        catchError(this.handleError)
      );

  }

  editNodeHTTP(node: NodeInterface) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + node.selfLink;

    const body = JSON.stringify(node);
    return this.http
      .put<NodeInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          const idx = this.nodes.findIndex(x => x.id === node.id);
          if (idx !== -1) {
            this.nodes[idx] = node;
            this.nodeSource.next(this.nodes);
          }
          return data;
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      if (!environment.production) {
        console.error('An error occurred:', error.error.message);
      }
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (!environment.production) {
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
