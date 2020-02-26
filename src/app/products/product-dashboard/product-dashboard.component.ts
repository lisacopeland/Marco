import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ReleasePlanService } from '@services/releaseplan.service';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { MatDialog } from '@angular/material/dialog';
import { PlanEditDialogComponent } from '../releaseplanedit/releaseplanedit.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductService } from '@shared/services/product.service';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { ProductEditDialogComponent } from '../productedit/productedit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-productdashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.scss']
})
export class ProductDashboardComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<boolean> = new Subject();
  product: ProductInterface;
  productId = '';
  displayedColumns: string[] = ['planId', 'name', 'description', 'tags', 'dashboard'];
  dataSource: MatTableDataSource<ReleasePlanInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private productService: ProductService,
              private releasePlanService: ReleasePlanService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.productId = params.id;
        console.log('product id is ' + this.productId);
        if (this.productId) {
          this.product = this.productService.getProductById(this.productId);
          this.releasePlanService.getPlanObservable()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(Plans => {
              this.dataSource = new MatTableDataSource<ReleasePlanInterface>(Plans.filter(x => x.parentId === this.productId));
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            });
        }
      });
  }

  onAdd() {
    const dialogRef = this.dialog.open(PlanEditDialogComponent, {
      width: '500px',
      data: {
        parentId: this.product.productId,
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
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      data: {
        header: 'Delete Product',
        cancelTooltip: 'Return to dashboard',
        message: 'All release plans and nodes will be deleted. Are you sure you want to delete this product?',
        buttons: ['Yes', 'No']
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'Yes') {
        console.log('result was yes');
        this.productService.delProduct(this.productId);
        this.router.navigateByUrl('/products');
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}

