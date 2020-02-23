import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ReleasePlanService } from '@services/releaseplan.service';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { MatDialog } from '@angular/material/dialog';
import { ReleasePlanEditDialogComponent } from '../releaseplanedit/releaseplanedit.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductService } from '@shared/services/product.service';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { ProductEditDialogComponent } from '../productedit/productedit.component';

@Component({
  selector: 'app-productdashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.scss']
})
export class ProductDashboardComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<boolean> = new Subject();
  product: ProductInterface;
  displayedColumns: string[] = ['id', 'name', 'dashboard'];
  dataSource: MatTableDataSource<ReleasePlanInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private productService: ProductService,
              private releasePlanService: ReleasePlanService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    // Pretend like you are passed the id of the product, and then get the release plans for
    // that product
    const productId = '2';
    this.product = this.productService.getProductById(productId);
    this.releasePlanService.getReleasePlanObservable()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(releasePlans => {
      this.dataSource = new MatTableDataSource<ReleasePlanInterface>(releasePlans.filter(x => x.productId === productId));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(ReleasePlanEditDialogComponent, {
      width: '500px',
      data: {
        productId: this.product.productId,
        releasePlan: null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  onEdit() {
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      width: '500px',
      data: this.product
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.product = result;
      }
    });
  }

  onDelete() {

  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}

