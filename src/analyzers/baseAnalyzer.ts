import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';

export abstract class baseAnalyzer {
  abstract analyze(document: OpenAPIV3.Document): criterionResult;
  
  protected createIssue(
    path: string,
    operation: string | undefined,
    location: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    suggestion: string,
    criterion: string
  ): issue {
    return {
      path,
      operation,
      location,
      description,
      severity,
      suggestion,
      criterion
    };
  }
  
  protected calculateScore(issues: issue[], maxChecks: number, maxScore: number): number {
    if (maxChecks === 0) return maxScore;
    
    const deductions = issues.reduce((total, issue) => {
      switch (issue.severity) {
        case 'critical': return total + 4;
        case 'high': return total + 3;
        case 'medium': return total + 2;
        case 'low': return total + 1;
        default: return total;
      }
    }, 0);
    
    const score = Math.max(0, maxScore - deductions);
    return Math.min(score, maxScore);
  }
}