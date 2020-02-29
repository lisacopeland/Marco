import { DatabaseInterface } from './database.interface';

// Format of nodeID: productName.planName:planNodeName

export interface PlanNodeInterface extends DatabaseInterface {
  nodeType: 'Milestone' | 'Task'; // Node type - cannot be changed
  predecessors: string[];         // Ids of the predecessors of this node
  delayedStartTimerDurationMins: number; // Dunno
  delayedStartTimerTrigger: '';          // Dunno
}

export interface PlanMilestoneInterface extends PlanNodeInterface {
  milestoneType: 'Start' | 'API' | 'Feature' | 'Service' | 'Product';
  label: string;
  declaredStatus: '';
  spanningPredecessors: any[];
}

export interface PlanTaskInterface extends PlanNodeInterface {
  taskType: string;
  taskData: string;
  inputs: string;
  expectedDurationMins: number;
}
