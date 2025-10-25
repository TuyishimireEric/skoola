export interface GoalDataI {
  Id: string;
  CreatedBy: string;
  Name: string;
  Type: "study_time" | "course" | "stars" | "custom";
  TargetValue?: number;
  TargetGameId?: string;
  DateKey: string;
  Completed: boolean;
  currentProgress?: number;
  calculatedCompleted?: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CreateGoalInputI {
  name: string;
  type: GoalDataI["Type"];
  targetValue?: number;
  targetGameId?: string;
  dateKey: string;
}

export interface CourseGameI {
  id: string;
  title: string;
}
