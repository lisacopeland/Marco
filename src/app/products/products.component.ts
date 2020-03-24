import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ProductService } from '@shared/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { takeUntil } from 'rxjs/operators';
import { ProductEditDialogComponent } from './productedit/productedit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<boolean> = new Subject();
  hasData = true;
  waiting = true;
  displayedColumns: string[] = ['id', 'name', 'description', 'dashboard'];
  dataSource: MatTableDataSource<ProductInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private productService: ProductService,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.productService.getProductsHttp()
      .subscribe(data => {
        this.waiting = false;
        if (data && (Object.keys(data).length !== 0)) {
          this.dataSource = new MatTableDataSource<ProductInterface>(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.hasData = true;
        } else {
          this.hasData = false;
        }
        this.subscribeToLookup();
      });
  }

  subscribeToLookup() {
    this.productService.productLookup.subscribe(data => {
      if (data && (Object.keys(data).length !== 0)) {
        this.dataSource = new MatTableDataSource<ProductInterface>(data as ProductInterface[]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.hasData = true;
      } else {
        this.hasData = false;
      }
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onDashboard(row) {
    this.router.navigate(
      [{ outlets: { primary: 'products/productdashboard', sidebar: 'productsidebar' }}], {queryParams: { id: row?.id }});
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

}
