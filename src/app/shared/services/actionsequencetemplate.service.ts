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
  headers = new HttpHeaders().set('Content-Type', 'text/plain');

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

    const url = environment.apiUrl + actionSequenceTemplatesLink;
    return this.http
      .get<GetResponse>(url, { observe: 'response', headers: this.headers })
      .pipe(
        map(response => {
          this.actionSequenceTemplates = response.body.actionSequenceTemplates;
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
    const url = environment.apiUrl + link;
    return this.http
      .get<ActionSequenceTemplateInterface>(url, { observe: 'response', headers: this.headers })
      .pipe(
        map(response => {
          return response.body;
        }),
        catchError(this.handleError)
      );
  }

  saveWorkingTemplate(template: ActionSequenceTemplateInterface) {
    const url = environment.apiUrl + template.saveLink;
    const body = JSON.stringify(template);
    return this.http
      .post<VerificationRequestInterface>(url, body, { observe: 'response', headers: this.headers })
      .pipe(
        map(response => {
          return response.body;
        }),
        catchError(this.handleError)
      );
  }

  verifyOrCommitTemplate(link: string) {
    const url = environment.apiUrl + link;
    const body = JSON.stringify(link);
    return this.http
      .post<VerificationRequestInterface>(url, body, { observe: 'response', headers: this.headers })
      .pipe(
        map(response => {
          return response.body;
        }),
        catchError(this.handleError)
      );
  }

  // Call the deleteAllLink or deleteWorkingLink
  deleteOrDeleteAll(link) {
    const url = environment.apiUrl + link;
    const body = JSON.stringify(link);
    return this.http
      .post<string>(url, body, { observe: 'response', headers: this.headers })
      .pipe(
        map(response => {
          return response.statusText;
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

  getActionSequenceTemplateById(id: string): ActionSequenceTemplateInterface {
    return this.actionSequenceTemplates.find(x => x.id === id);
  }

  // Returns true if the name is taken, false if otherwise
  checkNameNotTaken(id: string): Observable<boolean | null> {
    const result = (this.actionSequenceTemplates.find(x => x.id === id) === undefined) ? true : false;
    return of(result);
  }

  addActionSequenceTemplate(actionSequenceTemplatesLink: string, newActionSequenceTemplate: ActionSequenceTemplateInterface) {

    const url = environment.apiUrl + actionSequenceTemplatesLink;

    const body = JSON.stringify(newActionSequenceTemplate);
    return this.http
      .post<ActionSequenceTemplateInterface>(url, body, { observe: 'response', headers: this.headers })
      .pipe(
        map(response => {
          this.actionSequenceTemplates.push(newActionSequenceTemplate);
          this.actionSequenceTemplateSource.next(this.actionSequenceTemplates);
          return response.body;
        }),
        catchError(this.handleError)
      );
  }

/*   this is not how you should 'edit' an action sequence
  editActionSequenceTemplate(actionSequenceTemplate: ActionSequenceTemplateInterface) {

    const url = environment.apiUrl + actionSequenceTemplate.saveLink;

    const body = JSON.stringify(actionSequenceTemplate);
    return this.http
      .post<ActionSequenceTemplateInterface>(url, body, { observe: 'response', headers: this.headers })
      .pipe(
        map(response => {
          const idx = this.actionSequenceTemplates.findIndex(x => x.id === actionSequenceTemplate.id);
          if (idx !== -1) {
            this.actionSequenceTemplates[idx] = actionSequenceTemplate;
            this.actionSequenceTemplateSource.next(this.actionSequenceTemplates);
          }
          return response.body;
        }),
        catchError(this.handleError)
      );
  } */

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
