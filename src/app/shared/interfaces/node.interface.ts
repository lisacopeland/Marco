export interface NodeInterface {
  name: string;
  id: string;
  predecessors: string[];
  releasePlanId: string;
}

export interface PlanNodeInterface {
  planNodeId: string;
  nodeType: 'Milestone' | 'Task';
  description: string;
  predecessors: string[];
  delayedStartTimerDurationMins: number;
  delayedStartTimerTrigger: '';
  planId: string;
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
