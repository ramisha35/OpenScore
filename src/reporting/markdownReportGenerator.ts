import { baseReportGenerator } from './baseReportGenerator';
import { scoringResult, issue } from '../scoring/types';

export class markdownReportGenerator extends baseReportGenerator {
  constructor() {
    super('md', 'text/markdown');
  }

  getTypeName(): string {
    return 'Markdown';
  }

  generate(result: scoringResult, apiTitle?: string): string {
    const title = apiTitle || 'Unknown API';
    const timestamp = this.getFormattedTimestamp();
    
    let markdown = this.generateHeader(title, timestamp);
    markdown += this.generateOverallScore(result);
    markdown += this.generateSummary(result);
    markdown += this.generateDetailedResults(result);
    markdown += this.generateRecommendations(result);
    markdown += this.generateFooter();
    
    return markdown;
  }

  private generateHeader(title: string, timestamp: string): string {
    return `# 🔍 OpenAPI Score Report: ${this.escapeMarkdown(title)}

**Generated:** ${timestamp}  
**Scorer:** Theneo OpenAPI Scorer v1.0.0

---

`;
  }

  private generateOverallScore(result: scoringResult): string {
    const gradeEmoji = this.getGradeEmoji(result.grade);
    const gradeDescription = this.getGradeDescription(result.grade);
    
    return `## 📊 Overall Score

<div align="center">

### ${gradeEmoji} ${result.overallScore}/100 | Grade: ${result.grade}
**${gradeDescription}**

</div>

`;
  }

  private generateSummary(result: scoringResult): string {
    const criticalEmoji = result.summary.criticalIssues > 0 ? '🚨' : '✅';
    
    return `## 📋 Executive Summary

| Metric | Count | Status |
|--------|-------|---------|
| **Total Issues** | ${result.totalIssues} | ${result.totalIssues === 0 ? '✅ Perfect' : result.totalIssues < 5 ? '🟡 Good' : '🔴 Needs Attention'} |
| **Critical Issues** | ${result.summary.criticalIssues} | ${criticalEmoji} ${result.summary.criticalIssues === 0 ? 'None' : 'Action Required'} |
| **High Issues** | ${result.summary.highIssues} | ${result.summary.highIssues === 0 ? '✅' : '🟠'} |
| **Medium Issues** | ${result.summary.mediumIssues} | ${result.summary.mediumIssues === 0 ? '✅' : '🟡'} |
| **Low Issues** | ${result.summary.lowIssues} | ${result.summary.lowIssues === 0 ? '✅' : '🟢'} |

`;
  }

  private generateDetailedResults(result: scoringResult): string {
    let markdown = `## 📈 Detailed Analysis

`;

    // Generate summary table
    markdown += `### Scoring Breakdown

| Criterion | Score | Percentage | Weight | Weighted Score | Issues |
|-----------|-------|------------|--------|----------------|--------|
`;

    result.criterionResults.forEach(criterion => {
      const percentage = this.calculatePercentage(criterion.score, criterion.maxScore);
      const emoji = this.getScoreEmoji(percentage);
      const weightPercent = Math.round(criterion.weight * 100);
      
      markdown += `| ${emoji} **${criterion.criterion}** | ${criterion.score}/${criterion.maxScore} | ${percentage}% | ${weightPercent}% | ${criterion.weightedScore.toFixed(1)} | ${criterion.issues.length} |\n`;
    });

    markdown += '\n';

    result.criterionResults.forEach(criterion => {
      markdown += this.generateCriterionSection(criterion);
    });

    return markdown;
  }

  private generateCriterionSection(criterion: any): string {
    const percentage = this.calculatePercentage(criterion.score, criterion.maxScore);
    const emoji = this.getScoreEmoji(percentage);
    const status = this.getStatusText(percentage);
    
    let section = `### ${emoji} ${criterion.criterion}

**Score:** ${criterion.score}/${criterion.maxScore} (${percentage}%) | **Status:** ${status}  
**Weight:** ${Math.round(criterion.weight * 100)}% | **Weighted Score:** ${criterion.weightedScore.toFixed(1)}

`;

    if (criterion.issues.length > 0) {
      section += `#### 🔍 Issues Found (${criterion.issues.length})

`;
      
      const groupedIssues = this.groupIssuesBySeverity(criterion.issues);
      const severityOrder = ['critical', 'high', 'medium', 'low'];
      
      severityOrder.forEach(severity => {
        if (groupedIssues[severity]) {
          section += this.generateIssueGroup(severity, groupedIssues[severity]);
        }
      });
    } else {
      section += `#### ✅ Perfect Score!

No issues found in this category. Excellent work! 🎉

`;
    }

    section += '---\n\n';
    return section;
  }

  private generateIssueGroup(severity: string, issues: issue[]): string {
    const severityEmoji = this.getSeverityEmoji(severity);
    const severityTitle = severity.charAt(0).toUpperCase() + severity.slice(1);
    
    let group = `##### ${severityEmoji} ${severityTitle} Issues (${issues.length})

`;

    issues.forEach((issue, index) => {
      group += `**${index + 1}.** ${this.escapeMarkdown(issue.description)}

- **📍 Location:** \`${issue.path}\`${issue.operation ? ` → \`${issue.operation}\`` : ''} → \`${issue.location}\`
- **💡 Suggestion:** ${this.escapeMarkdown(issue.suggestion)}

`;
    });

    return group;
  }

  private generateRecommendations(result: scoringResult): string {
    let recommendations = `## 🎯 Recommendations

`;

    if (result.summary.criticalIssues > 0) {
      recommendations += `### 🚨 **Critical Action Required**

You have **${result.summary.criticalIssues} critical issue(s)** that must be addressed immediately. These issues significantly impact API quality and should be your top priority.

`;
    }

    if (result.overallScore < 60) {
      recommendations += `### ⚠️ **Quality Alert**

Your overall score of **${result.overallScore}/100** is below the acceptable threshold. Consider:

1. **Immediate Action:** Address all critical and high-priority issues
2. **Documentation Review:** Ensure all endpoints have proper descriptions
3. **Schema Validation:** Add proper data types and validation rules
4. **Best Practices:** Follow OpenAPI specification guidelines

`;
    } else if (result.overallScore < 80) {
      recommendations += `### 📈 **Improvement Opportunities**

Your score of **${result.overallScore}/100** is good but has room for improvement:

`;
    }


    const worstCriterion = this.getWorstPerformingCriterion(result);
    if (this.calculatePercentage(worstCriterion.score, worstCriterion.maxScore) < 70) {
      recommendations += `### 🔧 **Focus Area: ${worstCriterion.criterion}**

This category scored **${worstCriterion.score}/${worstCriterion.maxScore}** (${this.calculatePercentage(worstCriterion.score, worstCriterion.maxScore)}%) and needs attention.

`;
    }

    recommendations += `### 💡 **General Tips for Better API Documentation**

1. **Complete Descriptions:** Ensure every endpoint, parameter, and response has meaningful descriptions
2. **Proper Examples:** Include request/response examples for all major operations  
3. **Consistent Naming:** Use clear, consistent naming conventions for paths and operations
4. **Error Handling:** Define appropriate HTTP status codes for all scenarios
5. **Security:** Implement and document proper authentication/authorization
6. **Versioning:** Use semantic versioning and document API changes

`;

    return recommendations;
  }

  private generateFooter(): string {
    return `---

## 📞 Need Help?

- 📧 **Support:** support@theneo.io
- 🌐 **Website:** [theneo.io](https://theneo.io)
- 📚 **Documentation:** [docs.theneo.io](https://docs.theneo.io)
- 🐛 **Issues:** [GitHub Issues](https://github.com/theneo-io/openapi-scorer/issues)

---

<div align="center">

**🚀 Generated by [Theneo OpenAPI Scorer](https://theneo.io)**  
*Helping developers create better APIs, one specification at a time.*

</div>
`;
  }

  private getGradeEmoji(grade: string): string {
    switch (grade) {
      case 'A': return '🏆';
      case 'B': return '👍';
      case 'C': return '👌';
      case 'D': return '👎';
      case 'F': return '💥';
      default: return '❓';
    }
  }

  private getStatusText(percentage: number): string {
    if (percentage >= 90) return '🟢 Excellent';
    if (percentage >= 80) return '🟡 Good';
    if (percentage >= 60) return '🟠 Fair';
    return '🔴 Needs Improvement';
  }

  private getWorstPerformingCriterion(result: scoringResult) {
    return result.criterionResults.reduce((worst, current) => {
      const worstPercentage = this.calculatePercentage(worst.score, worst.maxScore);
      const currentPercentage = this.calculatePercentage(current.score, current.maxScore);
      return currentPercentage < worstPercentage ? current : worst;
    });
  }

  generateSimple(result: scoringResult, apiTitle?: string): string {
    const title = apiTitle || 'Unknown API';
    
    return `# OpenAPI Score Report: ${title}

**Score:** ${result.overallScore}/100 | **Grade:** ${result.grade}  
**Issues:** ${result.totalIssues} total (${result.summary.criticalIssues} critical, ${result.summary.highIssues} high)

| Criterion | Score | Issues |
|-----------|-------|--------|
${result.criterionResults.map(c => {
  const percentage = this.calculatePercentage(c.score, c.maxScore);
  const emoji = this.getScoreEmoji(percentage);
  return `| ${emoji} ${c.criterion} | ${c.score}/${c.maxScore} (${percentage}%) | ${c.issues.length} |`;
}).join('\n')}

*Generated by Theneo OpenAPI Scorer*
`;
  }
}