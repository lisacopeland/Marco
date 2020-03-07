import { Injectable } from '@angular/core';
import { PlanNodeInterface } from '../interfaces/node.interface';
import { environment } from '@environments/environment';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, take } from 'rxjs/operators';
import { DatabaseInterface } from '@shared/interfaces/database.interface';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  nodes: PlanNodeInterface[] = [];
  apiUrl = environment.apiUrl;
  private nodeSource = new BehaviorSubject<PlanNodeInterface[]>(this.nodes);
  nodeLookup = this.nodeSource.asObservable();

  constructor(private http: HttpClient) { }

  cacheNodes(nodes: PlanNodeInterface[]) {
    this.nodes = nodes as PlanNodeInterface[];
    this.nodeSource.next(this.nodes.slice());
  }

  addNodeCache(node: PlanNodeInterface) {
    this.nodes.push(node);
    this.nodeSource.next(this.nodes.slice());
  }

  editNodeCache(node: PlanNodeInterface) {
    const idx = this.nodes.findIndex(x => x.id === node.id);
    if (idx !== -1) {
      this.nodes[idx] = node;
      this.nodeSource.next(this.nodes.slice());
    }
  }

  delNodeCache(node: PlanNodeInterface) {
    const idx = this.nodes.findIndex(x => x.id === node.id);
    if (idx !== -1) {
      this.nodes.splice(idx, 1);
      this.nodeSource.next(this.nodes);
    }
  }

  getNodesHttp(nodeLink: string) {
    interface GetResponse {
      nodes: PlanNodeInterface[];
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
      .get<PlanNodeInterface>(url, httpOptions)
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
  checkNameNotTaken(nodeId: string): Observable<boolean | null> {
    const result = (this.nodes.find(x => x.id === nodeId) === undefined) ? true : false;
    return of(result);
  }

  addNodeHTTP(nodeLink: string, node: PlanNodeInterface) {

    const url = environment.apiUrl + '/' + nodeLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const body = JSON.stringify(node);
    return this.http
      .post<PlanNodeInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          this.nodes.push(node);
          this.nodeSource.next(this.nodes);
          return data;
        }),
        catchError(this.handleError)
      );
  }

  delNodeHTTP(node: PlanNodeInterface) {

    const url = environment.apiUrl + '/' + node.selfLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .delete<PlanNodeInterface>(url, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
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

  editNodeHTTP(node: PlanNodeInterface) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + node.selfLink;

    const body = JSON.stringify(node);
    return this.http
      .put<PlanNodeInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
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
