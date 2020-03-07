import { DatabaseInterface } from './database.interface';

// Format of nodeID: productName.planName:planNodeName
// timerTrigger in edit form should be a select which allows
// user to select one of the other plan nodes
export interface PlanNodeInterface extends DatabaseInterface {
  nodeType: 'Milestone' | 'Task' | 'MilestoneLink'; // Node type - cannot be changed
  predecessors: string[];         // Ids of the predecessors of this node, not used if this is a MilestoneLink
  timerDurationMinutes: number;   // Dunno - not used if this is a MilestoneLink
  timerTrigger: string;           // this is typically a nodeid, not used if this is a MilestoneLink
}

// The user uses these to show "state" like start
export interface PlanMilestoneInterface extends PlanNodeInterface {
  milestoneType: 'Start' | 'API' | 'Feature' | 'Service' | 'Product';
  label: string; // Descriptive text to identify the milestone type
  stateAnnounced: string; // For example, state description like "Generally Available"
  spanningPredecessors: any[]; // NodeIds of Milestones that this node is preceded by
}

export interface PlanTaskInterface extends PlanNodeInterface {
  taskType: string;
  taskData: string;
  inputs: TaskTemplateInputInterface[];
  expectedDurationMinutes: number;
}

export interface TaskTemplateInputInterface {
  name: string;
  description: string;
  valueReference: string;
  validation: string;
}

// Used for links external to this release plan
export interface MilestoneLinkInterface extends PlanNodeInterface {
  linkedId: string;    // ReleasePlanNodeId
  linkedMilestoneType: 'Start' | 'API' | 'Feature' | 'Service' | 'Product';
  linkedLabel: string;  // Descriptive text to identify the milestone type
  linkedStateAnnounced: string; // For example, state description like "Generally Available"
}
