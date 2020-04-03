import { Component, OnInit, Inject, Input, OnChanges } from '@angular/core';
import { NodeInterface, MilestoneNodeInterface, ActionNodeInterface, LinkPointNodeInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { delay, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActionTypeInterface } from '@shared/interfaces/actiontype.interface';
import { ProductService } from '@shared/services/product.service';

// This dialog mutates the data or adds data but does not
// Make database changes
// This dialog is for editing Tasks and Milestones,
// MilestoneLinks are edited in the MilestoneLinkEdit Component

export interface NodeEditDataInterface {
  node: NodeInterface;
  parentId: string;
}

@Component({
  selector: 'app-actionnode-edit',
  templateUrl: './actionnodeedit.component.html',
  styleUrls: ['./actionnodeedit.component.scss']
})
export class ActionNodeEditComponent implements OnInit, OnChanges {
  @Input() parentForm: FormGroup;
  @Input() node: ActionNodeInterface;
  actionNodeFormGroup: FormGroup;
  actionTypes: ActionTypeInterface[];
  currentActionType: ActionTypeInterface;
  editMode = false;

  constructor(private productService: ProductService,
              private nodeService: NodeService) { }

  ngOnInit(): void {

  }


  ngOnChanges() {
    if (this.node) {
      this.editMode = true;
    }
    this.productService.getActionTypesHttp()
      .subscribe(data => {
        this.actionTypes = data;
        this.initForm();
    });

  }

  comparer(o1: any, o2: any): boolean {
    // if possible compare by object's name property - and not by reference.
    return o1 && o2 ? o1.id === o2.id : o2 === o2;
  }

  initForm() {

    this.actionNodeFormGroup = new FormGroup({
      actionType: new FormControl('', Validators.required),
    });
    if (this.editMode) {
      this.currentActionType = this.actionTypes.find(x => x.id === this.node.actionTypeId);
      this.actionNodeFormGroup.patchValue({
        actionType: this.currentActionType
      });
    }
    this.parentForm.addControl('actionNodeForm', this.actionNodeFormGroup);
  }

  getActionNodeData() {
    return this.actionNodeFormGroup.value();
  }

  onNameChanges(): void {
    this.actionNodeFormGroup.get('name').valueChanges.subscribe(val => {
      this.currentActionType = val;
      });
  }

}
