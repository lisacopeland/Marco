import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodeInterface } from '../shared/interfaces/node.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NodeService } from '../shared/services/node.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-nodedetail',
  templateUrl: './nodedetail.component.html',
  styleUrls: ['./nodedetail.component.scss']
})
export class NodeDashboardComponent implements OnInit {

  node: NodeInterface;

  constructor(private route: ActivatedRoute,
              private nodeService: NodeService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.node = this.nodeService.getNodeById(params.get('id'));
    });
  }

  onEdit() {

  }

  addLine() {

  }

  deleteLine() {

  }

  onDelete() {
    // For when the user wants to delete this note, show confirmation modal
  }

}
