export type StudentAssessmentStatus = "completed" | "incomplete";

export type StudentAssessmentRecord = {
  id: string;
  studentId: string;
  scaleId: string;
  scaleName: string;
  startedAt: string;
  completedAt?: string;
  status: StudentAssessmentStatus;
  isValid: boolean;
};
