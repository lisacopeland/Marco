import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ReleasePlanService } from '@services/releaseplan.service';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { MatDialog } from '@angular/material/dialog';
import { PlanEditDialogComponent, PlanEditDataInterface } from '../releaseplanedit/releaseplanedit.component';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductService } from '@shared/services/product.service';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { ProductEditDialogComponent } from '../productedit/productedit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';
import { environment } from '@environments/environment';

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
          this.productService.getProductHttp(this.productId)
            .pipe(
              switchMap(product => {
                this.product = product;
                return this.releasePlanService.getReleasePlansHttp(this.product.releasePlanLink);
              }))
            .subscribe((data: any) => {
              if (data && (Object.keys(data).length !== 0)) {
                this.dataSource = new MatTableDataSource<ReleasePlanInterface>(data);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              }
              this.subscribeToLookup();
            }, error => {
                if (!environment.production) {
                  console.log('got error getting data' + error);
                }
          });
        }
      });
  }

  subscribeToLookup() {
    this.releasePlanService.releasePlanLookup.subscribe(data => {
      if (data && (Object.keys(data).length !== 0)) {
        this.dataSource = new MatTableDataSource<ReleasePlanInterface>(data as ReleasePlanInterface[]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  onAdd() {
    const editData: PlanEditDataInterface = {
      parentId: this.productId,
      planLink: this.product.releasePlanLink,
      releasePlan: null
    };
    const dialogRef = this.dialog.open(PlanEditDialogComponent, {
      width: '500px',
      data: editData
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
        this.productService.delProduct(this.product)
          .subscribe(() => {
            this.router.navigateByUrl('/products');
          });
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}

