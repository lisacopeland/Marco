import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ReleasePlanService } from '../shared/services/releaseplan.service';
import { ReleasePlanInterface } from '../shared/interfaces/releaseplan.interface';
import { NodeService } from '../shared/services/node.service';
import { NodeInterface } from '../shared/interfaces/node.interface';
import { ReleasePlanEditDialogComponent } from '../releaseplanedit/releaseplanedit.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  releasePlan: ReleasePlanInterface;
  nodes: NodeInterface[];

  constructor(private route: ActivatedRoute,
              private nodeService: NodeService,
              public dialog: MatDialog,
              private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.releasePlan = this.releasePlanService.getReleasePlanById(params.get('id'));
      this.nodes = this.nodeService.getNodes(this.releasePlan.id);
    });
  }

  onEdit() {
    const dialogRef = this.dialog.open(ReleasePlanEditDialogComponent, {
      width: '500px',
      data: this.releasePlan
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('the releaseplan was updated');
        this.releasePlan = result;
      } else {
        console.log('the release plan was not updated');
      }
    });
  }

  onAddNode() {

  }

  onDelNode() {

  }

  onDeletePlan() {

  }

}
