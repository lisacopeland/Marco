import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '@shared/services/product.service';
import { Observable } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

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
    }
    this.initForm();
  }

  initForm() {
    this.productForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('', [Validators.required, Validators.minLength(2)]),
    });
    if (this.editMode) {
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description
      });
      this.productForm.get('name').disable();
    } else {
      this.productForm.get('name').setValidators(Validators.required);
      this.productForm.get('name').setAsyncValidators([
        this.validateNameAvailability.bind(this)]);
    }
  }

  validateNameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.productService.checkNameNotTaken(control.value)
      .pipe(
        delay(1000),
        map(res => {
          if (res) {
            this.productForm.get('name').setErrors({ nameTaken: true });
            return;
          }
          return null;
        }),
        catchError(() => null)
      );
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
        productId: this.productForm.value.name,
        description: this.productForm.value.description,
        name: this.productForm.value.name,
        selfLink: '',
        planLink: ''
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
