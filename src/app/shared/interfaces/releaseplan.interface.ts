export interface ReleasePlanInterface {
  id: string;
  name: string;
  productId: string;
}

export interface PlanInterface {
  planId: string;
  description: string;
  startNodeId: string;
  deploymentId: string;
  tags: string[];
}
