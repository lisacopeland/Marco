export interface VerificationRequestInterface {
id: string;
templateId: string;
commitOnVerify: boolean;
isCompleted: boolean;
isVerified: boolean;
createdAt: Date;
completedAt: Date;
reports: VerificationReportInterface[];
}

export interface VerificationReportInterface {
  report: string;
  source: string;
  writtenAt: Date;
  isVerified: boolean;
  isComplete: boolean;
  }
