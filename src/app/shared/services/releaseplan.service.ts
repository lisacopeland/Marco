import { Injectable } from '@angular/core';
import { ReleasePlanInterface } from '../interfaces/releaseplan.interface';

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
  constructor() { }

  getReleasePlans(): ReleasePlanInterface[] {
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
      this.releasePlans.push(newReleasePlan);
    }
  }

  delReleasePlan(ReleasePlanId: string) {
    const idx = this.releasePlans.findIndex(x => x.id === ReleasePlanId);

    if (idx !== -1) {
      this.releasePlans.splice(idx, 1);
    }
  }

  editReleasePlan(newReleasePlan) {
    const idx = this.releasePlans.findIndex(x => x.id === newReleasePlan.id);
    this.releasePlans[idx] = newReleasePlan;
  }
}
