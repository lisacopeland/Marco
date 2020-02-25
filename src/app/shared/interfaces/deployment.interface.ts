export interface DeploymentInterface {
  deploymentId: string;   // Made up of the deployment name
  deploymentName: string; // name of the deployment, must be unique and cannot be changed
  description: string;    // Description of the deployment
  state: string;          // State of the deployment
  tagsUsed: string[];     // Tags of the deployment
  releaseIds: string[];   // Release Ids
}
