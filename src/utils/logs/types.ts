export interface LogMessage {
  message: string;
  links: {
    text: string;
    path: string;
  }[];
}
export type UserInfo = {
  name: string;
} | null;

export enum NotificationTopic {
  careplanContributor = 1,
  careplanReview = 2,
  fratrisk = 3,
  incidentReport = 4,
  incidentReview = 5,
  legalStatus = 6,
  initialAssessment = 7,
  investigations = 8,
  riskAssessment = 9,
  observationLevel = 11,
  task = 10,
}
