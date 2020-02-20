import { Component, OnInit } from '@angular/core';
import { ReleasePlanService } from '../shared/services/releaseplan.service';
import { ReleasePlanInterface } from '../shared/interfaces/releaseplan.interface';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  releasePlans: ReleasePlanInterface[];

  constructor(private releasePlanService: ReleasePlanService) { }

  ngOnInit(): void {
    this.releasePlans = this.releasePlanService.getReleasePlans();
  }

}
