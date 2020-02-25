import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ReleasePlanService } from '@services/releaseplan.service';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { NodeService } from '@services/node.service';
import { NodeInterface } from '@interfaces/node.interface';
import { ReleasePlanEditDialogComponent } from '../releaseplanedit/releaseplanedit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-releaseplan-dashboard',
  templateUrl: './releaseplan-dashboard.component.html',
  styleUrls: ['./releaseplan-dashboard.component.scss']
})
export class ReleasePlanDashboardComponent implements OnInit {
  releasePlan: ReleasePlanInterface;
  releasePlanId: string;
  nodes: NodeInterface[];
  displayedColumns: string[] = ['id', 'name', 'hasPredecessors', 'dashboard'];
  dataSource: MatTableDataSource<NodeInterface>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private nodeService: NodeService,
              public dialog: MatDialog,
              private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.releasePlanId = params.id;
        console.log('plan id is ' + this.releasePlanId);
        if (this.releasePlanId) {
          this.releasePlan = this.releasePlanService.getReleasePlanById(this.releasePlanId);
          this.nodes = this.nodeService.getNodes(this.releasePlan.id);
          this.dataSource = new MatTableDataSource<NodeInterface>(this.nodes);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });
  }

  onEdit() {
    const dialogRef = this.dialog.open(ReleasePlanEditDialogComponent, {
      width: '500px',
      data: {
        productId: this.releasePlan.productId,
        releasePlan: this.releasePlan
      }
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

  onDelete() {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      data: {
        header: 'Delete Release Plan',
        cancelTooltip: 'Return to dashboard',
        message: 'All nodes will be deleted. Are you sure you want to delete this release plan?',
        buttons: ['Yes', 'No']
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'Yes') {
        console.log('result was yes');
        this.releasePlanService.delReleasePlan(this.releasePlanId);
        this.router.navigateByUrl('/products', { queryParams: { id: this.releasePlan.productId }});
      }
    });
  }

}
