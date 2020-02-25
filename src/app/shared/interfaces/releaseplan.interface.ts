export interface ReleasePlanInterface {
  planId: string;       // ID for the record productName.planName
  parentId: string;     // id from the parent record
  name: string;         // Name of the plan, must be unique for this product and cannot be changed
  description: string;  // Description of the plan
  startNodeId: string;  // First node in this plan
  deploymentId: string; // Dunno
  tags: string[];       // Tags for this release
  selfLink: string;     // URL for PUT (to self) DELETE (self)
  planNodeLink: string; // URL for GET (all nodes) POST (new node) DELETE (all nodes)
}
