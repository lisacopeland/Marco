import { Injectable } from '@angular/core';
import { ProductInterface } from '../interfaces/product.interface';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { take, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  apiUrl = environment.apiUrl;
  private productsSource = new BehaviorSubject<{}>({});
  productLookup = this.productsSource.asObservable();
  products: ProductInterface[];
  private productSource = new BehaviorSubject<{}>({});
  currentProductChanged = this.productSource.asObservable();
  currentProduct: ProductInterface;

  constructor(private http: HttpClient) { }

  getProductObservable(): Observable<ProductInterface[]> {
    return this.productLookup as Observable<ProductInterface[]>;
  }

  // Use the currentProduct behaviour subject to communicate with the
  // sidebar
  setCurrentProduct(product: ProductInterface) {
    this.currentProduct = product;
    this.productSource.next(product);
  }

  getProductsHttp() {
    interface GetResponse {
      namespaces: ProductInterface[];
    }

    const apiUrl = environment.apiUrl + '/api/v1/namespaces';
    const headers =  new HttpHeaders().set('Content-Type', 'text/plain');

    return this.http
      .get<GetResponse>(apiUrl, { observe: 'response', headers })
      .pipe(
        map(response => {
          console.log(response);
          this.products = response.body.namespaces;
          this.productsSource.next(this.products);
          return this.products.slice();
        }),
        catchError(this.handleError)
      );
  }

  getProductSource() {
    return this.productsSource
      .pipe(
        map(data => {
          if (Object.keys(data).length === 0) {
            this.getProductsHttp()
              .pipe(
                take(1)
              ).subscribe(dataFromCall => {
                return dataFromCall;
              });
          } else {
            return data;
          }
        })
      );
  }

  getProductHttp(id: string) {
    const apiUrl = environment.apiUrl + '/api/v1/namespaces/' + id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .get<ProductInterface>(apiUrl, httpOptions)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(this.handleError)
      );
  }

  // Returns true if the name is not taken, false if otherwise
  checkNameNotTaken(name: string): Observable<boolean | null> {
    const result = (this.products.find(x => x.namespace === name) === undefined) ? true : false;
    return of(result);
  }

  addProduct(newProduct: ProductInterface) {

    const apiUrl = environment.apiUrl + '/api/v1/namespaces';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    const body = JSON.stringify(newProduct);
    return this.http
      .post<ProductInterface>(apiUrl, body, httpOptions)
      .pipe(
        map(data => {
          this.products.push(newProduct);
          this.productsSource.next(this.products);
          return data;
        }),
        catchError(this.handleError)
      );
  }

  delProduct(product: ProductInterface) {

    const apiUrl = environment.apiUrl + '/api/v1/namespaces/product.name';

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .delete<ProductInterface>(apiUrl, httpOptions)
      .pipe(
        map(data => {
          const idx = this.products.findIndex(x => x.namespace === product.namespace);
          if (idx !== -1) {
            this.products.splice(idx, 1);
            this.productsSource.next(this.products);
          }
          return data;
        }),
        catchError(this.handleError)
      );

  }

  editProduct(product: ProductInterface) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };

    const apiUrl = environment.apiUrl + '/api/v1/namespaces/product.name';

    const body = JSON.stringify(product);
    return this.http
      .put<ProductInterface>(apiUrl, body, httpOptions)
      .pipe(
        map(data => {
          const idx = this.products.findIndex(x => x.namespace === product.namespace);
          if (idx !== -1) {
            this.products[idx] = product;
            this.productsSource.next(this.products);
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
