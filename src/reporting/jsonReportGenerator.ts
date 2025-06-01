import { baseReportGenerator } from './baseReportGenerator';
import { scoringResult } from '../scoring/types';

export class jsonReportGenerator extends baseReportGenerator {
  constructor() {
    super('json', 'application/json');
  }

  getTypeName(): string {
    return 'JSON';
  }

  generate(result: scoringResult, apiTitle?: string): string {
    const metadata = this.generateMetadata(apiTitle);
    
    const report = {
      metadata,
      summary: {
        overallScore: result.overallScore,
        grade: result.grade,
        gradeDescription: this.getGradeDescription(result.grade),
        totalIssues: result.totalIssues,
        issueBreakdown: result.summary
      },
      analysis: {
        criterionResults: result.criterionResults.map(criterion => ({
          criterion: criterion.criterion,
          score: criterion.score,
          maxScore: criterion.maxScore,
          percentage: this.calculatePercentage(criterion.score, criterion.maxScore),
          weight: criterion.weight,
          weightedScore: criterion.weightedScore,
          issueCount: criterion.issues.length,
          issues: criterion.issues.map(issue => ({
            path: issue.path,
            operation: issue.operation,
            location: issue.location,
            description: issue.description,
            severity: issue.severity,
            suggestion: issue.suggestion,
            criterion: issue.criterion
          }))
        }))
      },
      statistics: {
        criteriaCount: result.criterionResults.length,
        passedCriteria: result.criterionResults.filter(c => 
          this.calculatePercentage(c.score, c.maxScore) >= 80
        ).length,
        averageScore: Math.round(
          result.criterionResults.reduce((sum, c) => 
            sum + this.calculatePercentage(c.score, c.maxScore), 0
          ) / result.criterionResults.length
        ),
        worstPerformingCriterion: this.getWorstPerformingCriterion(result),
        bestPerformingCriterion: this.getBestPerformingCriterion(result)
      },
      recommendations: this.generateRecommendations(result)
    };
    
    return JSON.stringify(report, null, 2);
  }

  private getWorstPerformingCriterion(result: scoringResult) {
    const worst = result.criterionResults.reduce((worst, current) => {
      const worstPercentage = this.calculatePercentage(worst.score, worst.maxScore);
      const currentPercentage = this.calculatePercentage(current.score, current.maxScore);
      return currentPercentage < worstPercentage ? current : worst;
    });

    return {
      criterion: worst.criterion,
      score: worst.score,
      maxScore: worst.maxScore,
      percentage: this.calculatePercentage(worst.score, worst.maxScore),
      issueCount: worst.issues.length
    };
  }

  private getBestPerformingCriterion(result: scoringResult) {
    const best = result.criterionResults.reduce((best, current) => {
      const bestPercentage = this.calculatePercentage(best.score, best.maxScore);
      const currentPercentage = this.calculatePercentage(current.score, current.maxScore);
      return currentPercentage > bestPercentage ? current : best;
    });

    return {
      criterion: best.criterion,
      score: best.score,
      maxScore: best.maxScore,
      percentage: this.calculatePercentage(best.score, best.maxScore),
      issueCount: best.issues.length
    };
  }

  private generateRecommendations(result: scoringResult): string[] {
    const recommendations: string[] = [];

    if (result.overallScore < 60) {
      recommendations.push("Critical: Overall score is below 60. Immediate action required to improve API quality.");
    } else if (result.overallScore < 80) {
      recommendations.push("Warning: Overall score could be improved. Focus on addressing high and critical issues.");
    }

    if (result.summary.criticalIssues > 0) {
      recommendations.push(`Address ${result.summary.criticalIssues} critical issue(s) immediately.`);
    }

    if (result.summary.highIssues > 0) {
      recommendations.push(`Resolve ${result.summary.highIssues} high-priority issue(s) soon.`);
    }

    result.criterionResults.forEach(criterion => {
      const percentage = this.calculatePercentage(criterion.score, criterion.maxScore);
      if (percentage < 50) {
        recommendations.push(`Focus on improving "${criterion.criterion}" - currently at ${percentage}%.`);
      }
    });

    if (result.summary.mediumIssues + result.summary.lowIssues > 10) {
      recommendations.push("Consider establishing API documentation standards to prevent future issues.");
    }

    return recommendations;
  }

  generateCompact(result: scoringResult, apiTitle?: string): string {
    const report = JSON.parse(this.generate(result, apiTitle));
    return JSON.stringify(report);
  }

  generateSchema(): string {
    const schema = {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://theneo.io/schemas/openapi-score-report.json",
      "title": "OpenAPI Score Report",
      "description": "Schema for Theneo OpenAPI Scorer reports",
      "type": "object",
      "properties": {
        "metadata": {
          "type": "object",
          "properties": {
            "timestamp": { "type": "string", "format": "date-time" },
            "apiTitle": { "type": "string" },
            "generator": { "type": "string" },
            "version": { "type": "string" }
          },
          "required": ["timestamp", "apiTitle", "generator", "version"]
        },
        "summary": {
          "type": "object",
          "properties": {
            "overallScore": { "type": "integer", "minimum": 0, "maximum": 100 },
            "grade": { "type": "string", "enum": ["A", "B", "C", "D", "F"] },
            "gradeDescription": { "type": "string" },
            "totalIssues": { "type": "integer", "minimum": 0 }
          },
          "required": ["overallScore", "grade", "totalIssues"]
        }
      },
      "required": ["metadata", "summary", "analysis"]
    };

    return JSON.stringify(schema, null, 2);
  }
}