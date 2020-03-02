import { DatabaseInterface } from './database.interface';

export interface ReleasePlanInterface extends DatabaseInterface {
  startNode: string;  // First node in this plan
  deploymentId: string; // Dunno
  tags: string;       // Tags for this release
  planNodeLink: string; // URL for GET (all nodes) POST (new node) DELETE (all nodes)
}
