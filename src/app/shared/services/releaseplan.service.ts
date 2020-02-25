import { Injectable } from '@angular/core';
import { ReleasePlanInterface } from '../interfaces/releaseplan.interface';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReleasePlanService {
  apiUrl = environment.apiUrl;

  releasePlans: ReleasePlanInterface[] = [
    {
      planId: 'product1.plan1',
      name: 'plan1',
      parentId: 'product1',
      description: 'Release Plan 1 for Product 1',
      startNodeId: 'product1.plan1.node1',
      deploymentId: '',
      tags: [],
      selfLink: this.apiUrl + '/product/product1/plans/plan1',
      planNodeLink: this.apiUrl + '/product/product1/plans/plan1/nodes'
    },
    {
      planId: 'product1.plan2',
      name: 'plan2',
      parentId: 'product1',
      description: 'Release Plan 2 for Product 1',
      startNodeId: 'product1.plan2.node1',
      deploymentId: '',
      tags: [],
      selfLink: this.apiUrl + '/product/product1/plans/plan2',
      planNodeLink: this.apiUrl + '/product/product1/plans/plan2/nodes'
    },
    {
      planId: 'product2.plan1',
      name: 'plan1',
      parentId: 'product2',
      description: 'Release Plan 1 for Product 2',
      startNodeId: '', // Null for new plan
      deploymentId: '',
      tags: [],
      selfLink: this.apiUrl + '/product/product2/plans/plan1',
      planNodeLink: this.apiUrl + '/product/product2/plans/plan1/nodes'
    },
  ];

  private releasePlansChanged: BehaviorSubject<ReleasePlanInterface[]> = new BehaviorSubject(this.releasePlans);

  constructor() { }

  getPlanObservable(): Observable<ReleasePlanInterface[]> {
    return this.releasePlansChanged.asObservable();
  }

  getPlans(): ReleasePlanInterface[] {
    this.releasePlansChanged.next(this.releasePlans);
    return this.releasePlans.slice();
  }

  getPlansByProductId(id: string) {
    return this.releasePlans.filter(x => x.parentId === id).slice();
  }

  getPlanById(id: string): ReleasePlanInterface {
    return this.releasePlans.find(x => x.planId === id);
  }

  // Returns true if the name is taken, false if otherwise
  checkNameNotTaken(planId: string): Observable<boolean | null> {
    const result = (this.releasePlans.find(x => x.planId === planId) === undefined) ? true : false;
    return of(result);
  }

  addPlan(newPlan: ReleasePlanInterface) {
    // Check if it already exists
    if (this.releasePlans.findIndex(x => x.planId === newPlan.planId) === -1) {
      newPlan.planId = newPlan.parentId + '.' + newPlan.name;
      this.releasePlans.push(newPlan);
      this.releasePlansChanged.next(this.releasePlans);
    }
  }

  delPlan(PlanId: string) {
    const idx = this.releasePlans.findIndex(x => x.planId === PlanId);

    if (idx !== -1) {
      this.releasePlans.splice(idx, 1);
      this.releasePlansChanged.next(this.releasePlans);
    }
  }

  editPlan(newPlan) {
    const idx = this.releasePlans.findIndex(x => x.planId === newPlan.planId);
    if (idx !== -1) {
      this.releasePlans[idx] = newPlan;
      this.releasePlansChanged.next(this.releasePlans);
    }
  }
}
