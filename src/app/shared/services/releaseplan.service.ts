import { Injectable } from '@angular/core';
import { ReleasePlanInterface } from '../interfaces/releaseplan.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReleasePlanService {

  releasePlans: ReleasePlanInterface[] = [
    {
      id: '1',
      name: 'Release Plan 1'
    }
  ];

  private releasePlansChanged: BehaviorSubject<ReleasePlanInterface[]> = new BehaviorSubject(this.releasePlans);

  constructor() { }

  getReleasePlanObservable(): Observable<ReleasePlanInterface[]> {
    return this.releasePlansChanged.asObservable();
  }

  getReleasePlans(): ReleasePlanInterface[] {
    this.releasePlansChanged.next(this.releasePlans);
    return this.releasePlans.slice();
  }

  getReleasePlanById(id: string): ReleasePlanInterface {
    return this.releasePlans.find(x => x.id === id);
  }

  checkForCircular(releasePlan: ReleasePlanInterface): boolean {
    // Check the releasePlan for circular dependency
    if (releasePlan) {
      // If there is a circular dependancy return true else return false
      // walk the release plan and see if any ReleasePlan is a predecessor of a further down one
    } else {
      return false;
    }
  }

  addReleasePlan(newReleasePlan: ReleasePlanInterface) {
    // Check if it already exists
    if (this.releasePlans.findIndex(x => x.id === newReleasePlan.id) === -1) {
      newReleasePlan.id = (this.releasePlans.length + 1).toString();
      this.releasePlans.push(newReleasePlan);
      this.releasePlansChanged.next(this.releasePlans);
    }
  }

  delReleasePlan(ReleasePlanId: string) {
    const idx = this.releasePlans.findIndex(x => x.id === ReleasePlanId);

    if (idx !== -1) {
      this.releasePlans.splice(idx, 1);
      this.releasePlansChanged.next(this.releasePlans);
    }
  }

  editReleasePlan(newReleasePlan) {
    const idx = this.releasePlans.findIndex(x => x.id === newReleasePlan.id);
    if (idx !== -1) {
      this.releasePlans[idx] = newReleasePlan;
      this.releasePlansChanged.next(this.releasePlans);
    }
  }
}
