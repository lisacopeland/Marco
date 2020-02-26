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
  products: ProductInterface[] = [
    {
      productId: 'product1',
      name: 'product1',
      description: 'Description of Product 1',
      selfLink: this.apiUrl + '/product/product1',
      planLink: this.apiUrl + '/product/product1/plans'
    },
    {
      productId: 'product2',
      name: 'product2',
      description: 'Description of Product 2',
      selfLink: this.apiUrl + '/product/product2',
      planLink: this.apiUrl + '/product/product2/plans'
    },
    {
      productId: 'product3',
      name: 'product3',
      description: 'Description of product 3',
      selfLink: this.apiUrl + '/product/product3',
      planLink: this.apiUrl + '/product/product3/plans'
    },
    {
      productId: 'product4',
      name: 'product4',
      description: 'Description of Product 4',
      selfLink: this.apiUrl + '/product/product4',
      planLink: this.apiUrl + '/product/product4/plans'
    }
  ];

  private productsChanged: BehaviorSubject<ProductInterface[]> = new BehaviorSubject(this.products);

  constructor(private http: HttpClient) { }

  getProductObservable(): Observable<ProductInterface[]> {
    return this.productsChanged.asObservable();
  }

  getProductsHttp() {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain'
      })
    };
    return this.http
      .get<ProductInterface>(environment.apiUrl + '/product', httpOptions)
      .pipe(
        take(1),
        map(data => {
          console.log('from HTTP call');
          console.log(JSON.stringify(data));
          return data;
        }),
        catchError(this.handleError)
      );
  }

  getProducts(): ProductInterface[] {
    this.productsChanged.next(this.products);
    return this.products.slice();
  }

  getProductById(id: string): ProductInterface {
    return this.products.find(x => x.productId === id);
  }

  // Returns true if the name is taken, false if otherwise
  checkNameNotTaken(productId: string): Observable<boolean | null> {
    const result = (this.products.find(x => x.productId === productId) === undefined) ? true : false;
    return of(result);
  }

  addProduct(newProduct: ProductInterface) {
    // Check if it already exists
    if (this.products.findIndex(x => x.productId === newProduct.productId) === -1) {
      newProduct.productId = newProduct.name;
      this.products.push(newProduct);
      this.productsChanged.next(this.products);
    }
  }

  delProduct(ProductId: string) {
    const idx = this.products.findIndex(x => x.productId === ProductId);

    if (idx !== -1) {
      this.products.splice(idx, 1);
      this.productsChanged.next(this.products);
    }
  }

  editProduct(newProduct) {
    const idx = this.products.findIndex(x => x.productId === newProduct.productId);
    if (idx !== -1) {
      this.products[idx] = newProduct;
      this.productsChanged.next(this.products);
    }
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
