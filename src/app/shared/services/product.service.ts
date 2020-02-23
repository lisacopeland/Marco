import { Injectable } from '@angular/core';
import { ProductInterface } from '../interfaces/product.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  products: ProductInterface[] = [
    {
      productId: '1',
      description: 'Product 1'
    },
    {
      productId: '2',
      description: 'Product 2'
    },
    {
      productId: '3',
      description: 'Product 3'
    },
    {
      productId: '4',
      description: 'Product 4'
    }
  ];

  private productsChanged: BehaviorSubject<ProductInterface[]> = new BehaviorSubject(this.products);

  constructor() { }

  getProductObservable(): Observable<ProductInterface[]> {
    return this.productsChanged.asObservable();
  }

  getProducts(): ProductInterface[] {
    this.productsChanged.next(this.products);
    return this.products.slice();
  }

  getProductById(id: string): ProductInterface {
    return this.products.find(x => x.productId === id);
  }

  addProduct(newProduct: ProductInterface) {
    // Check if it already exists
    if (this.products.findIndex(x => x.productId === newProduct.productId) === -1) {
      newProduct.productId = (this.products.length + 1).toString();
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
}
