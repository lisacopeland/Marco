import { DatabaseInterface } from './database.interface';
import { PlanNodeInterface } from './node.interface';

export interface ReleasePlanInterface extends DatabaseInterface {
  view: 'Summary' | 'Master' | 'Working';
  tags: string[];       // Tags for this release
  nodes: PlanNodeInterface[];
  verificationReports: ReleasePlanVerificationReportInterface[];
  verifyLink: string | null;  // Used to call the api for verifying
  commitLink: string | null;  // Used for verifiying and commiting to master
  masterViewLink: string | null; // Used to see the master plan
  summaryViewLink: string | null; // Used to get the summary plan
  workingViewLink: string | null; // Used to get the working plan
}

export interface ReleasePlanVerificationReportInterface {
  report: string;   // Text description about the verification
  source: string;   // Who was the verifier
  createdOn: Date;  // When this report was created
  isVerified: boolean; // Whether this report shows the releaseplan was verified
}

