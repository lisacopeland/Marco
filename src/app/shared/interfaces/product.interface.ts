import { DatabaseInterface } from './database.interface';

export interface ProductInterface extends DatabaseInterface {
  automationTriggersLink: string;
  automationTemplatesLink: string;
  actionSequenceTemplatesLink: string;
  actionTypesLink: string;
}
