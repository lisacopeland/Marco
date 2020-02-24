export interface DeploymentInterface {
  deploymentId: string;
  description: string;
  state: string;
  tagsUsed: string[];
  releaseIds: string[];
}
