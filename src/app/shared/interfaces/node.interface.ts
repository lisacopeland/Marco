import { DatabaseInterface } from './database.interface';
import { InputInterface } from './actiontype.interface';

// Format of nodeID: productName.planName:planNodeName
// timerTrigger in edit form should be a select which allows
// user to select one of the other plan nodes
export interface NodeInterface extends DatabaseInterface {
  nodeType: 'Milestone' | 'Action' | 'LinkPoint'; // Node type - cannot be changed
  predecessors: string[];         // Ids of the predecessors of this node, not used if this is a MilestoneLink
  timerDurationMinutes: number;   // Not for LinkPoint
  timerTrigger: string;           // Not on LinkPoint this is typically a nodeid,
}

// The user uses these to show "state" like start
export interface MilestoneNodeInterface extends NodeInterface {
  milestoneType: 'Start' | 'Infrastructure' | 'API' | 'Feature' | 'Service' | 'Product' | 'Internal' | 'External';
  label: string; // Descriptive text to identify the milestone type
  stateAnnounced: string; // For example, state description like "Generally Available"
  spanningPredecessors: any[]; // NodeIds of Milestones that this node is preceded by
}

export interface ActionNodeInterface extends NodeInterface {
  actionTypeId: string;   // From the ActionType
  actionData: string;     // From the ActionType
  inputs: InputInterface[];
  expectedDurationMinutes: number; // Default value from action type
}

// Used for links external to this release plan
// For UI - display other possible release plans and then
// Display other possible milestones - alert user if 1) there
// are no other release plans 2) if there are no milestones
// LinkedId - the id of the linkedId, other fields are copied
// from that milestone, just display, user cannot modify
export interface LinkPointNodeInterface extends NodeInterface {
  linkedId: string;    // ReleasePlanNodeId
  linkedMilestoneType: 'Start' | 'API' | 'Feature' | 'Service' | 'Product';
  linkedLabel: string;  // Descriptive text to identify the milestone type
  linkedStateAnnounced: string; // For example, state description like "Generally Available"
}
