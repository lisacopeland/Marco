import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ReleasePlanService } from '@services/releaseplan.service';
import { ReleasePlanInterface } from '@interfaces/releaseplan.interface';
import { NodeService } from '@services/node.service';
import { PlanNodeInterface } from '@interfaces/node.interface';
import { PlanEditDialogComponent, PlanEditDataInterface } from '../releaseplanedit/releaseplanedit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertDialogComponent } from 'src/app/alert-dialog/alert-dialog.component';
import { NodeEditDialogComponent, NodeEditDataInterface } from '../nodeedit/nodeedit.component';
import { environment } from '@environments/environment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-plan-dashboard',
  templateUrl: './releaseplan-dashboard.component.html',
  styleUrls: ['./releaseplan-dashboard.component.scss']
})
export class PlanDashboardComponent implements OnInit {
  releasePlan: ReleasePlanInterface;
  releasePlanId: string;
  selfLink: string;
  nodes: PlanNodeInterface[];
  displayedColumns: string[] = ['planNodeId', 'description', 'type', 'hasPredecessors', 'dashboard'];
  dataSource: MatTableDataSource<PlanNodeInterface>;
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
        this.selfLink = params.selfLink;  // The planLink from the parent record
        console.log('plan id is ' + this.releasePlanId);
        if (this.releasePlanId) {
          this.releasePlanService.getReleasePlanHttp(this.selfLink)
            .pipe(
              switchMap(releasePlan => {
                this.releasePlan = releasePlan;
                return this.nodeService.getNodesHttp(this.releasePlan.planNodeLink);
              }))
            .subscribe((data: any) => {
              if (data && (Object.keys(data).length !== 0)) {
                this.dataSource = new MatTableDataSource<PlanNodeInterface>(data);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
              }
              this.subscribeToLookup();
            }, error => {
              if (!environment.production) {
                console.log('got error getting data' + error);
              }
            });
        }
      });
  }

  subscribeToLookup() {
    this.nodeService.nodeLookup.subscribe(data => {
      if (data && (Object.keys(data).length !== 0)) {
        this.dataSource = new MatTableDataSource<PlanNodeInterface>(data as PlanNodeInterface[]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  onEdit() {
    const editData: PlanEditDataInterface = {
      planLink: this.releasePlan.planNodeLink,
      selfLink: this.selfLink,
      releasePlan: this.releasePlan
    };
    const dialogRef = this.dialog.open(PlanEditDialogComponent, {
      width: '500px',
      data: editData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('the plan was updated');
        this.releasePlan = result;
      } else {
        console.log('the release plan was not updated');
      }
    });
  }

  onAddNode() {
    const editData: NodeEditDataInterface = {
      parentId: this.releasePlanId,
      nodeLink: this.releasePlan.planNodeLink,
      node: null
    };

    const dialogRef = this.dialog.open(NodeEditDialogComponent, {
      width: '500px',
      data: editData
    });

    dialogRef.afterClosed().subscribe(result => {
    });
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
        this.releasePlanService.delReleasePlan(this.releasePlan)
          .subscribe(() => {
            this.router.navigateByUrl('/products', { queryParams: { id: this.releasePlan.parentId }});
          });
      }
    });
  }

}
