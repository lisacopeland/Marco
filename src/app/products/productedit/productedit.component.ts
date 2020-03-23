import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductInterface } from '@shared/interfaces/product.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '@shared/services/product.service';
import { Observable } from 'rxjs';
import { delay, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-productedit',
  templateUrl: './productedit.component.html',
  styleUrls: ['./productedit.component.scss']
})
export class ProductEditDialogComponent implements OnInit {

  editTitle = 'Add New Product';
  productForm: FormGroup;
  product: ProductInterface;
  productName: string;
  editMode = false;

  constructor(private productService: ProductService,
              private snackBar: MatSnackBar,
              public dialogRef: MatDialogRef<ProductEditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ProductInterface) { }

  ngOnInit(): void {
/*     this.editMode = this.data !== null;
    if (this.editMode) {
      this.productName = this.data.namespace;
      this.product = this.data;
      this.editTitle = 'Editing ' + this.product.namespace;
    } */
    this.initForm();
  }

  initForm() {
    this.productForm = new FormGroup({
      name: new FormControl(''),
    });
    if (this.editMode) {
      this.productForm.patchValue({
        name: this.product.namespace
      });
      this.productForm.get('name').disable();
    } else {
      this.productForm.get('name').setValidators([Validators.required]);
      // this.productForm.get('name').setValidators([Validators.required, Validators.pattern('[0 - 9A - Z] *')]);
      this.productForm.get('name').setAsyncValidators([
        this.validateNameAvailability.bind(this)]);
      this.onNameChanges();
    }
  }

  validateNameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.productService.checkNameNotTaken(control.value)
      .pipe(
        delay(1000),
        map(res => {
          if (!res) {
            this.productForm.get('name').setErrors({ nameTaken: true });
            return;
          }
          return null;
        }),
        catchError(() => null)
      );
  }

  onNameChanges(): void {
    this.productForm.get('name').valueChanges.pipe
      (debounceTime(300),
       distinctUntilChanged()).
      subscribe(val => {
        this.productForm.patchValue({
        name: val.toUpperCase()
      });
        if (this.productForm.get('name').hasError('nameTaken')) {
        console.log('name is taken!');
      }
    });
  }

  getErrorMessage() {
    if (this.productForm.get(name).hasError('required')) {
      return 'You must enter a value';
    } else if (this.productForm.get(name).hasError('nameTaken')) {
      return 'This name is taken';
    } else {
      return 'invalid';
    }
  }

  onSubmit() {
    if (this.productForm.status === 'INVALID') {
      this.snackBar.open('Please fill in required fields', '', {
        duration: 2000,
      });
      return;
    }
    if (this.editMode) {
      this.productService.editProduct(this.product);
      this.snackBar.open('Product successfully updated', '', {
        duration: 2000,
      });
    } else {
      const product = {
        namespace: this.productForm.value.name,
        automationTriggersLink: '',
        automationTemplatesLink: '',
        actionSequenceTemplatesLink: '',
        actionTypesLink: ''
      };

      this.productService.addProduct(product)
        .subscribe(() => {
          this.snackBar.open('Product successfully added', '', {
            duration: 2000,
          });
        }, error => {
          console.log('error adding product ' + error);
        });
    }
    this.dialogRef.close(this.product);
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
