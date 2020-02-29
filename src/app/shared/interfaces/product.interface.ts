import { DatabaseInterface } from './database.interface';

export interface ProductInterface extends DatabaseInterface {
  releasePlanLink: string;    // url for plans under this product, GET (all plans) POST(new plan), DELETE(all plans)
}
