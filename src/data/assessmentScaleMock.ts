export type AssessmentScaleOption = {
  id: string;
  name: string;
};

export const assessmentScaleOptions: AssessmentScaleOption[] = [
  { id: "phq-9", name: "PHQ-9 抑郁症筛查量表" },
  { id: "gad-7", name: "GAD-7 广泛性焦虑量表" },
  { id: "psqi", name: "PSQI 匹兹堡睡眠质量指数" },
  { id: "sds", name: "SDS 抑郁自评量表" },
];
