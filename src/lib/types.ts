export interface Survey {
  id: string;
  name: string;
  answer: string;
}

export const surveyKeys = {
  all: () => ['surveys'] as const,
  add: () => ['addSurvey'] as const,
};
