import { Injectable } from '@angular/core';
import { ReleasePlanInterface } from '../interfaces/releaseplan.interface';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { take, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReleasePlanService {
  apiUrl = environment.apiUrl;
  httpCalled = false;
  private releasePlanSource = new BehaviorSubject<{}>({});
  releasePlanLookup = this.releasePlanSource.asObservable();
  releasePlans: ReleasePlanInterface[];
  private currentPlanSource = new BehaviorSubject<{}>({});
  currentPlanChanged = this.currentPlanSource.asObservable();
  currentPlan: ReleasePlanInterface;

  constructor(private http: HttpClient) { }

  setCurrentPlan(releasePlan: ReleasePlanInterface) {
    this.currentPlan = releasePlan;
    this.currentPlanSource.next(this.currentPlan);
  }

  getCurrentPlan() {
    return this.currentPlan;
  }

  // A get to this URL from the product This URL re
  getReleasePlansHttp(releasePlanLink: string) {
    interface GetResponse {
      releasePlans: ReleasePlanInterface[];
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + releasePlanLink;
    return this.http
      .get<GetResponse>(url, httpOptions)
      .pipe(
        map(data => {
          this.releasePlans = data.releasePlans;
          console.log('releaseplans : ' + JSON.stringify(this.releasePlans));
          if (this.releasePlans.length) {
            this.releasePlanSource.next(this.releasePlans);
          }
          return this.releasePlans.slice();
        }),
        catchError(this.handleError)
      );
  }

  getReleasePlan(link: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + link;
    return this.http
      .get<ReleasePlanInterface>(url, httpOptions)
      .pipe(
        map(data => {
          console.log('releaseplan : ' + JSON.stringify(data));
          return data;
        }),
        catchError(this.handleError)
      );
  }

  getReleasePlanSource(releasePlanLink: string) {
    return this.releasePlanSource
      .pipe(
        map(data => {
          if (Object.keys(data).length === 0) {
            this.getReleasePlansHttp(releasePlanLink)
              .subscribe(dataFromCall => {
                return dataFromCall;
            });
          } else {
            return data;
          }
        })
      );
  }

  getReleasePlanHttp(selfLink: string) {
    const url = environment.apiUrl + '/' + selfLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .get<ReleasePlanInterface>(url, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          return data;
        }),
        catchError(this.handleError)
      );
  }

  getReleasePlanById(id: string): ReleasePlanInterface {
    return this.releasePlans.find(x => x.id === id);
  }

  // Returns true if the name is taken, false if otherwise
  checkNameNotTaken(id: string): Observable<boolean | null> {
    const result = (this.releasePlans.find(x => x.id === id) === undefined) ? true : false;
    return of(result);
  }

  addReleasePlan(releasePlanLink: string, newReleasePlan: ReleasePlanInterface) {

    const url = environment.apiUrl + '/' + releasePlanLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const body = JSON.stringify(newReleasePlan);
    return this.http
      .post<ReleasePlanInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          this.releasePlans.push(newReleasePlan);
          this.releasePlanSource.next(this.releasePlans);
          return data;
        }),
        catchError(this.handleError)
      );
  }

  delReleasePlan(releasePlan: ReleasePlanInterface) {

    const url = environment.apiUrl + '/' +  releasePlan.selfLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .delete<ReleasePlanInterface>(url, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          const idx = this.releasePlans.findIndex(x => x.id === releasePlan.id);
          if (idx !== -1) {
            this.releasePlans.splice(idx, 1);
            this.releasePlanSource.next(this.releasePlans);
          }
          return data;
        }),
        catchError(this.handleError)
      );

  }

  editReleasePlan(releasePlan: ReleasePlanInterface) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + releasePlan.selfLink;

    const body = JSON.stringify(releasePlan);
    return this.http
      .put<ReleasePlanInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          const idx = this.releasePlans.findIndex(x => x.id === releasePlan.id);
          if (idx !== -1) {
            this.releasePlans[idx] = releasePlan;
            this.releasePlanSource.next(this.releasePlans);
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
