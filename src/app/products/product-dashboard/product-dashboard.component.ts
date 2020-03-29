import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActionSequenceTemplateService } from '@shared/services/actionsequencetemplate.service';
import { ActionSequenceTemplateInterface } from '@shared/interfaces/actionsequencetemplate.interface';
import { MatDialog } from '@angular/material/dialog';
import { PlanEditDialogComponent, PlanEditDataInterface } from '../releaseplanedit/releaseplanedit.component';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
  dataSource: MatTableDataSource<ActionSequenceTemplateInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private productService: ProductService,
              private actionSequenceTemplateService: ActionSequenceTemplateService,
              public dialog: MatDialog) { }

  ngOnInit(): void {

    this.route.queryParams
      .subscribe(params => {
        this.productId = params.id;
        if (this.productId) {
          this.productService.getProductHttp(this.productId)
            .pipe(
              switchMap(product => {
                this.product = product;
                this.productService.setCurrentProduct(this.product);
                return this.actionSequenceTemplateService.getActionSequenceTemplatesHttp(this.product.actionSequenceTemplatesLink);
              }))
            .subscribe((data: any) => {
              if (data && (Object.keys(data).length !== 0)) {
                this.dataSource = new MatTableDataSource<ActionSequenceTemplateInterface>(data);
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
    this.actionSequenceTemplateService.actionSequenceTemplateLookup.subscribe(data => {
      if (data && (Object.keys(data).length !== 0)) {
        this.dataSource = new MatTableDataSource<ActionSequenceTemplateInterface>(data as ActionSequenceTemplateInterface[]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  onGotoPlan(row) {
    this.actionSequenceTemplateService.setCurrentTemplate(row);
    this.router.navigate(
      [{ outlets:
       { primary: 'products/newdashboard',
         sidebar: 'plandashboardsidebar' } }],
       { queryParams: { id: row?.id, committedLink: row?.committedLink } });
  }

  onAdd() {
    const editData: PlanEditDataInterface = {
      planLink: this.product.actionSequenceTemplatesLink,
      actionSequenceTemplate: null
    };
    const dialogRef = this.dialog.open(PlanEditDialogComponent, {
      width: '500px',
      data: editData
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onEdit() {
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      width: '500px',
      data: this.product
    });
    dialogRef.afterClosed().subscribe(result => {
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

