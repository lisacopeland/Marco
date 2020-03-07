import { DatabaseInterface } from './database.interface';

export interface ProductInterface extends DatabaseInterface {
  releasePlanLink: string;    // URL to get an array of releasePlan summaries
}
