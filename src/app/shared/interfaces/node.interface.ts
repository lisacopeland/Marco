// Format of nodeID: productName.planName:planNodeName

export interface PlanNodeInterface {
  planNodeId: string;             // Unique ID for this node
  planNodeName: string;           // Must be unique for this plan
  nodeType: 'Milestone' | 'Task'; // Node type - cannot be changed
  description: string;            // Description of this node
  predecessors: string[];         // Ids of the predecessors of this node
  delayedStartTimerDurationMins: number; // Dunno
  delayedStartTimerTrigger: '';          // Dunno
  parentId: string;               // productName.planName
  selfLink: string;               // url for PUT(this object), DELETE(this object)
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
