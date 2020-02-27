import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ProductService } from '@shared/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { takeUntil } from 'rxjs/operators';
import { ProductEditDialogComponent } from './productedit/productedit.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<boolean> = new Subject();
  displayedColumns: string[] = ['productId', 'name', 'description', 'dashboard'];
  dataSource: MatTableDataSource<ProductInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private productService: ProductService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getProducts();
    this.productService.getProductObservable()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(products => {
      this.dataSource = new MatTableDataSource<ProductInterface>(products);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  getProducts() {
    this.productService.getProductsHttp()
      .subscribe(products => {
        this.dataSource = new MatTableDataSource<ProductInterface>(products);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.productService.getProductObservable()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(changedProducts => {
            this.dataSource = new MatTableDataSource<ProductInterface>(changedProducts);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });

      });
  }

  onAdd() {
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

}
