import { DatabaseInterface } from './database.interface';
import { NodeInterface } from './node.interface';

export interface ActionSequenceTemplateInterface extends DatabaseInterface {
  view: 'Summary' | 'Master' | 'Working';
  tags: string[];       // Tags for this release
  nodes: NodeInterface[];
  verifyStatusLink: string | null;
  verifyLink: string | null;  // Returns the verification data
  commitLink: string | null;  // Returns the verification data
  saveLink: string | null;    // Returns the working copy (Which you passed into the call)
  deleteAllLink: string | null; // Hard delete - deletes all versions of the plan, and all nodes
  deleteWorkingLink: string | null; // Deletes the working version, like resetting
  committedLink: string | null; // Used to get the master plan
  workingLink: string | null; // Used to get the working plan
}

