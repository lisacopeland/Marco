import { Component, OnInit } from '@angular/core';
import { ProductService } from '@shared/services/product.service';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { MatDialog } from '@angular/material/dialog';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { PlanEditDataInterface, PlanEditDialogComponent } from 'src/app/products/releaseplanedit/releaseplanedit.component';
import { ProductEditDialogComponent } from 'src/app/products/productedit/productedit.component';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';
import { Router } from '@angular/router';

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 1000,
  hideDelay: 500,
  touchendHideDelay: 1000,
};

@Component({
  selector: 'app-product-sidebar',
  templateUrl: './product-sidebar.component.html',
  styleUrls: ['./product-sidebar.component.scss'],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }
  ]
})
export class ProductSidebarComponent implements OnInit {

  product: ProductInterface;
  constructor(private router: Router,
              private productService: ProductService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.currentProductChanged
      .subscribe(product => {
        this.product = product as ProductInterface;
      });
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
            this.router.navigate([{ outlets: { primary: 'products', sidebar: 'productssidebar' } }]);
          });
      }
    });
  }

}
