import { scoringCriterion } from "./types";

export class scoringConfiguration {
  public static readonly CRITERIA: scoringCriterion[] = [
    { name: 'Schema & Types', weight: 0.2, maxScore: 20 },
    { name: 'Descriptions & Documentation', weight: 0.2, maxScore: 20 },
    { name: 'Paths & Operations', weight: 0.15, maxScore: 15 },
    { name: 'Response Codes', weight: 0.15, maxScore: 15 },
    { name: 'Examples & Samples', weight: 0.1, maxScore: 10 },
    { name: 'Security', weight: 0.1, maxScore: 10 },
    { name: 'Miscellaneous Best Practices', weight: 0.1, maxScore: 10 }
  ];

  public static calculateGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  public static getCriterionByName(name: string): scoringCriterion | undefined {
    return this.CRITERIA.find(criterion => criterion.name === name);
  }
}