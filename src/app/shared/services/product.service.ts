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

  constructor(private http: HttpClient) { }

  getProductObservable(): Observable<ProductInterface[]> {
    return this.productLookup as Observable<ProductInterface[]>;
  }

  getProductsHttp() {
    interface GetResponse {
      products: ProductInterface[];
    }

    const apiUrl = environment.apiUrl + '/api/v1/data/PRODUCT';

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .get<GetResponse>(apiUrl, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          this.products = data.products;
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
    const apiUrl = environment.apiUrl + '/api/v1/data/PRODUCT/' + id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .get<ProductInterface>(apiUrl, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          return data;
        }),
        catchError(this.handleError)
      );
  }

  // Returns true if the name is not taken, false if otherwise
  checkNameNotTaken(id: string): Observable<boolean | null> {
    const result = (this.products.find(x => x.id === id) === undefined) ? true : false;
    return of(result);
  }

  addProduct(newProduct: ProductInterface) {

    const apiUrl = environment.apiUrl + '/api/v1/data/PRODUCT';
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
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          this.products.push(newProduct);
          this.productsSource.next(this.products);
          return data;
        }),
        catchError(this.handleError)
      );
  }

  delProduct(product: ProductInterface) {

    const url = environment.apiUrl + '/' + product.selfLink;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .delete<ProductInterface>(url, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          const idx = this.products.findIndex(x => x.id === product.id);
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

    const url = environment.apiUrl + '/' + product.selfLink;

    const body = JSON.stringify(product);
    return this.http
      .put<ProductInterface>(url, body, httpOptions)
      .pipe(
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          const idx = this.products.findIndex(x => x.id === product.id);
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
