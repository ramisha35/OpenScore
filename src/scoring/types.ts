export interface scoringCriterion {
  name: string;
  weight: number;
  maxScore: number;
}

export interface issue {
  path: string;
  operation?: string;
  location: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  criterion: string;
}

export interface criterionResult {
  criterion: string;
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  issues: issue[];
}

export interface scoringResult {
  overallScore: number;
  grade: string;
  criterionResults: criterionResult[];
  totalIssues: number;
  summary: {
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
}