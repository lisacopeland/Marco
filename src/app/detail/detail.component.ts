import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ReleasePlanService } from '../shared/services/releaseplan.service';
import { ReleasePlanInterface } from '../shared/interfaces/releaseplan.interface';
import { NodeService } from '../shared/services/node.service';
import { NodeInterface } from '../shared/interfaces/node.interface';
import { ReleasePlanEditDialogComponent } from '../releaseplanedit/releaseplanedit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  releasePlan: ReleasePlanInterface;
  nodes: NodeInterface[];
  displayedColumns: string[] = ['id', 'name', 'hasPredecessors', 'dashboard'];
  dataSource: MatTableDataSource<NodeInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private route: ActivatedRoute,
              private nodeService: NodeService,
              public dialog: MatDialog,
              private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.releasePlan = this.releasePlanService.getReleasePlanById(params.get('id'));
      this.nodes = this.nodeService.getNodes(this.releasePlan.id);
      this.dataSource = new MatTableDataSource<NodeInterface>(this.nodes);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
