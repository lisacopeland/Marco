import { Injectable } from '@angular/core';
import { ActionSequenceTemplateInterface } from '../interfaces/actionsequencetemplate.interface';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { take, map, catchError } from 'rxjs/operators';
import { VerificationRequestInterface } from '@shared/interfaces/verification.interface';

@Injectable({
  providedIn: 'root'
})
export class ActionSequenceTemplateService {
  apiUrl = environment.apiUrl;
  httpCalled = false;
  private actionSequenceTemplateSource = new BehaviorSubject<{}>({});
  actionSequenceTemplateLookup = this.actionSequenceTemplateSource.asObservable();
  actionSequenceTemplates: ActionSequenceTemplateInterface[];
  private currentTemplateSource = new BehaviorSubject<{}>({});
  currentTemplateChanged = this.currentTemplateSource.asObservable();
  currentTemplate: ActionSequenceTemplateInterface;

  constructor(private http: HttpClient) { }

  setCurrentTemplate(actionSequenceTemplate: ActionSequenceTemplateInterface) {
    this.currentTemplate = actionSequenceTemplate;
    this.currentTemplateSource.next(this.currentTemplate);
  }

  getCurrentTemplate() {
    return this.currentTemplate;
  }

  // A get to this URL from the product This URL re
  getActionSequenceTemplatesHttp(actionSequenceTemplatesLink: string) {
    interface GetResponse {
      actionSequenceTemplates: ActionSequenceTemplateInterface[];
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + actionSequenceTemplatesLink;
    return this.http
      .get<GetResponse>(url, httpOptions)
      .pipe(
        map(data => {
          this.actionSequenceTemplates = data.actionSequenceTemplates;
          if (this.actionSequenceTemplates.length) {
            this.actionSequenceTemplateSource.next(this.actionSequenceTemplates);
          }
          return this.actionSequenceTemplates.slice();
        }),
        catchError(this.handleError)
      );
  }

  // Used to get the working or committed plan
  getActionSequenceTemplate(link: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + link;
    return this.http
      .get<ActionSequenceTemplateInterface>(url, httpOptions)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(this.handleError)
      );
  }

  verifyOrCommitTemplate(link: string) {
    const url = environment.apiUrl + '/' + link;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    return this.http
      .post<VerificationRequestInterface>(url, httpOptions)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(this.handleError)
      );
  }

  deleteOrDeleteAll(link) {
    const url = environment.apiUrl + '/' + link;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    return this.http
      .post(url, httpOptions)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(this.handleError)
      );
  }

  getActionSequenceTemplateSource(actionSequenceTemplatesLink: string) {
    return this.actionSequenceTemplateSource
      .pipe(
        map(data => {
          if (Object.keys(data).length === 0) {
            this.getActionSequenceTemplatesHttp(actionSequenceTemplatesLink)
              .subscribe(dataFromCall => {
                return dataFromCall;
            });
          } else {
            return data;
          }
        })
      );
  }

  getActionSequenceTemplateHttp(selfLink: string) {
    const url = environment.apiUrl + '/' + selfLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .get<ActionSequenceTemplateInterface>(url, httpOptions)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(this.handleError)
      );
  }

  getActionSequenceTemplateById(id: string): ActionSequenceTemplateInterface {
    return this.actionSequenceTemplates.find(x => x.id === id);
  }

  // Returns true if the name is taken, false if otherwise
  checkNameNotTaken(id: string): Observable<boolean | null> {
    const result = (this.actionSequenceTemplates.find(x => x.id === id) === undefined) ? true : false;
    return of(result);
  }

  addActionSequenceTemplate(actionSequenceTemplatesLink: string, newActionSequenceTemplate: ActionSequenceTemplateInterface) {

    const url = environment.apiUrl + '/' + actionSequenceTemplatesLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const body = JSON.stringify(newActionSequenceTemplate);
    return this.http
      .post<ActionSequenceTemplateInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          this.actionSequenceTemplates.push(newActionSequenceTemplate);
          this.actionSequenceTemplateSource.next(this.actionSequenceTemplates);
          return data;
        }),
        catchError(this.handleError)
      );
  }

  delActionSequenceTemplate(actionSequenceTemplate: ActionSequenceTemplateInterface) {

    const url = environment.apiUrl + '/' +  actionSequenceTemplate.selfLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .delete<ActionSequenceTemplateInterface>(url, httpOptions)
      .pipe(
        map(data => {
          const idx = this.actionSequenceTemplates.findIndex(x => x.id === actionSequenceTemplate.id);
          if (idx !== -1) {
            this.actionSequenceTemplates.splice(idx, 1);
            this.actionSequenceTemplateSource.next(this.actionSequenceTemplates);
          }
          return data;
        }),
        catchError(this.handleError)
      );

  }

  editActionSequenceTemplate(actionSequenceTemplate: ActionSequenceTemplateInterface) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const url = environment.apiUrl + '/' + actionSequenceTemplate.selfLink;

    const body = JSON.stringify(actionSequenceTemplate);
    return this.http
      .put<ActionSequenceTemplateInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          const idx = this.actionSequenceTemplates.findIndex(x => x.id === actionSequenceTemplate.id);
          if (idx !== -1) {
            this.actionSequenceTemplates[idx] = actionSequenceTemplate;
            this.actionSequenceTemplateSource.next(this.actionSequenceTemplates);
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
