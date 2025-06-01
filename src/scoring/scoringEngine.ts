import { OpenAPIV3 } from 'openapi-types';
import { scoringResult, criterionResult } from './types';
import { scoringConfiguration } from './scoringConfiguration';
import {baseAnalyzer,descriptionsAndDocumentationAnalyzer,
    examplesAndSamplesAnalyzer, miscellaneousBestPracticesAnalyzer,
    pathsAndOperationsAnalyzer, responseCodesAnalyzer,
    schemaAndTypesAnalyzer, securityAnalyzer
 } from '../analyzers/index'

export class scoringEngine {
  private analyzers: Map<string, baseAnalyzer>;

  constructor() {
    this.analyzers = new Map();
    this.initializeAnalyzers();
  }

  private initializeAnalyzers(): void {
    this.analyzers.set('Schema & Types', new schemaAndTypesAnalyzer());
    this.analyzers.set('Descriptions & Documentation', new descriptionsAndDocumentationAnalyzer());
    this.analyzers.set('Paths & Operations', new pathsAndOperationsAnalyzer());
    this.analyzers.set('Response Codes', new responseCodesAnalyzer());
    this.analyzers.set('Examples & Samples', new examplesAndSamplesAnalyzer());
    this.analyzers.set('Security', new securityAnalyzer());
    this.analyzers.set('Miscellaneous Best Practices', new miscellaneousBestPracticesAnalyzer());
  }

  async scoreOpenAPISpec(document: OpenAPIV3.Document): Promise<scoringResult> {
    console.log('Starting OpenAPI specification analysis...');
    
    const criterionResults: criterionResult[] = [];
    let totalWeightedScore = 0;

    for (const criterion of scoringConfiguration.CRITERIA) {
      console.log(`Analyzing: ${criterion.name}`);
      
      const analyzer = this.analyzers.get(criterion.name);
      if (!analyzer) {
        throw new Error(`No analyzer found for criterion: ${criterion.name}`);
      }

      try {
        const result = analyzer.analyze(document);
        
        const weightedScore = (result.score / result.maxScore) * criterion.weight * 100;
        
        const criterionResult: criterionResult = {
          ...result,
          weight: criterion.weight,
          weightedScore: weightedScore
        };

        criterionResults.push(criterionResult);
        totalWeightedScore += weightedScore;

        console.log(`${criterion.name}: ${result.score}/${result.maxScore} (${result.issues.length} issues)`);
      } catch (error) {
        console.error(`Error analyzing ${criterion.name}:`, error);
        criterionResults.push({
          criterion: criterion.name,
          score: 0,
          maxScore: criterion.maxScore,
          weight: criterion.weight,
          weightedScore: 0,
          issues: [{
            path: 'N/A',
            location: 'Analyzer',
            description: `Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'critical',
            suggestion: 'Fix the analyzer implementation or the OpenAPI specification',
            criterion: criterion.name
          }]
        });
      }
    }

    const allIssues = criterionResults.flatMap(result => result.issues);
    const overallScore = Math.round(totalWeightedScore);
    const grade = scoringConfiguration.calculateGrade(overallScore);

    const summary = {
      criticalIssues: allIssues.filter(issue => issue.severity === 'critical').length,
      highIssues: allIssues.filter(issue => issue.severity === 'high').length,
      mediumIssues: allIssues.filter(issue => issue.severity === 'medium').length,
      lowIssues: allIssues.filter(issue => issue.severity === 'low').length
    };

    const result: scoringResult = {
      overallScore,
      grade,
      criterionResults,
      totalIssues: allIssues.length,
      summary
    };

    console.log(`Analysis complete. Overall score: ${overallScore}/100 (Grade: ${grade})`);
    console.log(`Total issues found: ${allIssues.length}`);

    return result;
  }

  getAvailableCriteria(): string[] {
    return Array.from(this.analyzers.keys());
  }

  hasAnalyzer(criterionName: string): boolean {
    return this.analyzers.has(criterionName);
  }
}