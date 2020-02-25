import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '@shared/services/product.service';

@Component({
  selector: 'app-productedit',
  templateUrl: './productedit.component.html',
  styleUrls: ['./productedit.component.scss']
})
export class ProductEditDialogComponent implements OnInit {

  editTitle = 'Add New Product';
  productForm: FormGroup;
  product: ProductInterface;
  productId: string;
  editMode = false;

  constructor(private productService: ProductService,
              private snackBar: MatSnackBar,
              public dialogRef: MatDialogRef<ProductEditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ProductInterface) { }

  ngOnInit(): void {
    this.productId = this.data.productId;
    this.editMode = this.data !== null;
    if (this.editMode) {
      this.product = this.data;
      this.editTitle = 'Editing ' + this.product.description;
    } else {
      this.product = {
        description: '',
        productId: this.productId
      };
    }
    this.initForm();
  }

  initForm() {
    this.productForm = new FormGroup({
      description: new FormControl(this.product.description, [Validators.required, Validators.minLength(2)])
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }
    if (this.editMode) {
      this.product.description = this.productForm.value.description;
      this.productService.editProduct(this.product);
      this.snackBar.open('Product successfully updated', '', {
        duration: 2000,
      });
    } else {
      const product = {
        description: this.productForm.value.description,
        productId: null
      };
      this.productService.addProduct(product);
      this.snackBar.open('Product successfully added', '', {
        duration: 2000,
      });
    }
    this.dialogRef.close(this.product);
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
