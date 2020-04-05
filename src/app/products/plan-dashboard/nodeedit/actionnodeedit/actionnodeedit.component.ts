import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { NodeInterface, MilestoneNodeInterface, ActionNodeInterface, LinkPointNodeInterface } from '@shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { NodeService } from '@shared/services/node.service';
import { ActionTypeInterface, InputInterface } from '@shared/interfaces/actiontype.interface';
import { ProductService } from '@shared/services/product.service';

// Creates a formgroup with the controls specific to an action node and attaches
// itself to the passed in parentForm
@Component({
  selector: 'app-actionnode-edit',
  templateUrl: './actionnodeedit.component.html',
  styleUrls: ['./actionnodeedit.component.scss']
})
export class ActionNodeEditComponent implements OnInit, OnChanges {
  @Input() parentForm: FormGroup;
  @Input() node: ActionNodeInterface;
  // @Input() actionTypes: ActionTypeInterface[];
  actionTypes: ActionTypeInterface[];
  @Output() nodeDescription = new EventEmitter();
  actionNodeForm: FormGroup;
  inputs: FormArray;
  currentActionType: ActionTypeInterface;
  editMode = false;
  onReady = false;

  constructor(private productService: ProductService,
              private nodeService: NodeService) { }

  ngOnInit(): void {

  }

  ngOnChanges() {
    console.log('action Types in ngonChanges ' + this.actionTypes);
  }

  comparer(o1: any, o2: any): boolean {
    // if possible compare by object's name property - and not by reference.
    return o1 && o2 ? o1.id === o2.id : o2 === o2;
  }

  initForm() {
    this.actionTypes = this.productService.getActionTypes();
    console.log('action types in initform ' + this.actionTypes);
    // Initialize the formgroup and attach it to the parentForm
    this.actionNodeForm = new FormGroup({
      actionType: new FormControl('', Validators.required),
      inputs: new FormArray([])
    });
    this.onActionTypeChanges();
    this.parentForm.addControl('actionNodeForm', this.actionNodeForm);
    this.actionNodeForm.setParent(this.parentForm);
    this.onReady = true;
  }

  patchForm() {
    // Editing an existing action node, get the current actiontype
    // Initializing currentActionType will display all of the fields
    // for the actionType
    this.editMode = true;
    this.currentActionType = this.actionTypes.find(x => x.id === this.node.actionType);
    this.actionNodeForm.get('actionType').disable();
    this.actionNodeForm.patchValue({
      actionType: this.currentActionType
    });
    this.initializeInputArray(this.node.inputs);
  }

  get inputsArray(): FormArray {
    return this.actionNodeForm.get('inputs') as FormArray;
  }

  addInput(input: InputInterface, inputArray: FormArray) {
    const newElement = new FormGroup({
      valueReference: new FormControl(input.valueReference)
    });
    inputArray.push(newElement);
  }

  initializeInputArray(inputs: InputInterface[]) {
    if (inputs && inputs.length) {
      const inputArray = this.actionNodeForm.get('inputs') as FormArray;
      inputArray.patchValue([]);
      inputs.forEach(element => {
        this.addInput(element, inputArray);
      });
    }
  }

  // This is only possible for a new action node
  onActionTypeChanges(): void {
    this.actionNodeForm.get('actionType').valueChanges
      .subscribe(val => {
        this.currentActionType = val;
        this.nodeDescription.emit(this.currentActionType.description);
        // Now initialize the formArray
        this.initializeInputArray(this.currentActionType.inputs);
      });
  }

}
