import { baseReportGenerator } from './baseReportGenerator';
import { scoringResult, issue } from '../scoring/types';

export class htmlReportGenerator extends baseReportGenerator {
  constructor() {
    super('html', 'text/html');
  }

  getTypeName(): string {
    return 'HTML';
  }

  generate(result: scoringResult, apiTitle?: string): string {
    const title = apiTitle || 'Unknown API';
    const timestamp = this.getFormattedTimestamp();
    
    return `<!DOCTYPE html>
<html lang="en">
${this.generateHead(title)}
<body>
  ${this.generateBody(result, title, timestamp)}
  ${this.generateScripts()}
</body>
</html>`;
  }

  private generateHead(title: string): string {
    return `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 OpenAPI Score Report - ${this.escapeHtml(title)}</title>
    <meta name="description" content="Comprehensive OpenAPI specification analysis and scoring report">
    <meta name="generator" content="Theneo OpenAPI Scorer">
    ${this.generateStyles()}
</head>`;
  }

  private generateStyles(): string {
    return `<style>
        :root {
          --primary-color: #4a5568;
          --success-color: #38a169;
          --warning-color: #d69e2e;
          --danger-color: #e53e3e;
          --info-color: #4299e1;
          --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --card-shadow: 0 10px 30px rgba(0,0,0,0.1);
          --border-radius: 15px;
          --transition: all 0.3s ease;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
          line-height: 1.6;
          color: var(--primary-color);
          background: var(--background-gradient);
          min-height: 100vh;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header Styles */
        .header {
          background: white;
          border-radius: var(--border-radius);
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: var(--card-shadow);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: var(--background-gradient);
        }
        
        .header h1 {
          color: var(--primary-color);
          margin-bottom: 10px;
          font-size: 2.5em;
          font-weight: 300;
        }
        
        .header h2 {
          color: #718096;
          margin-bottom: 25px;
          font-weight: 400;
        }
        
        .score-card {
          display: inline-block;
          background: ${this.getScoreColor(85)};
          background: linear-gradient(45deg, var(--success-color), var(--info-color));
          color: white;
          padding: 25px 50px;
          border-radius: 50px;
          font-size: 1.8em;
          font-weight: bold;
          margin: 20px 0;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          transition: var(--transition);
          cursor: default;
        }
        
        .score-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.2);
        }
        
        .timestamp {
          color: #a0aec0;
          font-size: 0.9em;
          margin-top: 15px;
        }
        
        /* Summary Grid */
        .summary {
          background: white;
          border-radius: var(--border-radius);
          padding: 35px;
          margin-bottom: 30px;
          box-shadow: var(--card-shadow);
        }
        
        .summary h2 {
          color: var(--primary-color);
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 3px solid #e2e8f0;
          font-size: 1.5em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 25px;
          margin-top: 25px;
        }
        
        .summary-item {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          border-left: 5px solid var(--info-color);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }
        
        .summary-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .summary-item h3 {
          color: var(--primary-color);
          margin-bottom: 10px;
          font-size: 1em;
          font-weight: 600;
        }
        
        .summary-value {
          font-size: 2.5em;
          font-weight: bold;
          color: var(--info-color);
          margin-bottom: 5px;
        }
        
        .summary-label {
          font-size: 0.85em;
          color: #718096;
        }
        
        /* Criteria Grid */
        .criteria-section {
          margin-bottom: 30px;
        }
        
        .section-title {
          background: white;
          border-radius: var(--border-radius);
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: var(--card-shadow);
          text-align: center;
        }
        
        .criteria-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 25px;
        }
        
        .criterion-card {
          background: white;
          border-radius: var(--border-radius);
          padding: 30px;
          box-shadow: var(--card-shadow);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }
        
        .criterion-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .criterion-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .criterion-title {
          font-size: 1.3em;
          font-weight: 600;
          color: var(--primary-color);
          flex: 1;
          margin-right: 15px;
        }
        
        .score-badge {
          padding: 10px 18px;
          border-radius: 25px;
          color: white;
          font-weight: bold;
          font-size: 0.95em;
          min-width: 80px;
          text-align: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        
        .criterion-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
          font-size: 0.9em;
        }
        
        .stat-item {
          background: #f7fafc;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }
        
        .stat-label {
          color: #718096;
          font-size: 0.8em;
          margin-bottom: 5px;
        }
        
        .stat-value {
          font-weight: bold;
          color: var(--primary-color);
        }
        
        .progress-container {
          margin: 20px 0;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9em;
          color: var(--primary-color);
        }
        
        .progress-bar {
          width: 100%;
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--info-color), var(--success-color));
          transition: width 0.8s ease;
          position: relative;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Issues Styles */
        .issues-section {
          margin-top: 25px;
        }
        
        .issues-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .issues-title {
          font-size: 1.1em;
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .issues-count {
          background: #e2e8f0;
          color: var(--primary-color);
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.8em;
          font-weight: bold;
        }
        
        .issue-item {
          background: #f7fafc;
          border-left: 4px solid;
          padding: 18px;
          margin-bottom: 12px;
          border-radius: 8px;
          transition: var(--transition);
        }
        
        .issue-item:hover {
          background: #edf2f7;
          transform: translateX(5px);
        }
        
        .issue-critical { border-left-color: var(--danger-color); }
        .issue-high { border-left-color: #dd6b20; }
        .issue-medium { border-left-color: var(--warning-color); }
        .issue-low { border-left-color: var(--success-color); }
        
        .issue-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        
        .severity-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.7em;
          font-weight: bold;
          text-transform: uppercase;
          color: white;
        }
        
        .severity-critical { background: var(--danger-color); }
        .severity-high { background: #dd6b20; }
        .severity-medium { background: var(--warning-color); }
        .severity-low { background: var(--success-color); }
        
        .issue-description {
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 8px;
        }
        
        .issue-location {
          font-size: 0.85em;
          color: #718096;
          margin-bottom: 10px;
          font-family: 'Monaco', 'Consolas', monospace;
          background: #f1f5f9;
          padding: 5px 8px;
          border-radius: 4px;
        }
        
        .issue-suggestion {
          font-style: italic;
          color: #4a5568;
          font-size: 0.9em;
          padding: 8px;
          background: rgba(66, 153, 225, 0.1);
          border-radius: 6px;
          border-left: 3px solid var(--info-color);
        }
        
        .no-issues {
          text-align: center;
          color: var(--success-color);
          font-weight: bold;
          padding: 30px;
          background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
          border-radius: 12px;
          border: 2px dashed var(--success-color);
        }
        
        .no-issues::before {
          content: '🎉';
          display: block;
          font-size: 2em;
          margin-bottom: 10px;
        }
        
        /* Footer */
        .footer {
          text-align: center;
          margin-top: 50px;
          color: white;
          font-size: 0.9em;
        }
        
        .footer a {
          color: white;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.3);
          transition: var(--transition);
        }
        
        .footer a:hover {
          border-bottom-color: white;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .criteria-grid {
            grid-template-columns: 1fr;
          }
          
          .header h1 {
            font-size: 2em;
          }
          
          .container {
            padding: 15px;
          }
          
          .criterion-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .score-badge {
            align-self: flex-start;
          }
        }
        
        @media (max-width: 480px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .criterion-stats {
            grid-template-columns: 1fr;
          }
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white;
          }
          
          .container {
            max-width: none;
            padding: 0;
          }
          
          .criterion-card,
          .header,
          .summary {
            box-shadow: none;
            border: 1px solid #e2e8f0;
          }
        }
        
        /* Accessibility */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* Animation for score reveal */
        .score-reveal {
          animation: scoreReveal 1s ease-out;
        }
        
        @keyframes scoreReveal {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
    </style>`;
  }

  private generateBody(result: scoringResult, title: string, timestamp: string): string {
    return `
    <div class="container">
        ${this.generateHeaderSection(result, title, timestamp)}
        ${this.generateSummarySection(result)}
        ${this.generateCriteriaSection(result)}
        ${this.generateFooterSection()}
    </div>`;
  }

  private generateHeaderSection(result: scoringResult, title: string, timestamp: string): string {
    const gradeDescription = this.getGradeDescription(result.grade);
    
    return `
        <header class="header">
            <h1>🔍 OpenAPI Score Report</h1>
            <h2>${this.escapeHtml(title)}</h2>
            <div class="score-card score-reveal" style="background: ${this.getScoreColor(result.overallScore)};">
                ${result.overallScore}/100 | Grade: ${result.grade}
            </div>
            <div class="timestamp">
                📅 Generated on ${timestamp} | 🏆 ${gradeDescription}
            </div>
        </header>`;
  }

  private generateSummarySection(result: scoringResult): string {
    return `
        <section class="summary">
            <h2>📊 Executive Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <h3>Total Issues</h3>
                    <div class="summary-value" style="color: ${result.totalIssues === 0 ? 'var(--success-color)' : result.totalIssues < 5 ? 'var(--warning-color)' : 'var(--danger-color)'};">
                        ${result.totalIssues}
                    </div>
                    <div class="summary-label">${this.getIssueStatusText(result.totalIssues)}</div>
                </div>
                <div class="summary-item" style="border-left-color: var(--danger-color);">
                    <h3>Critical Issues</h3>
                    <div class="summary-value" style="color: var(--danger-color);">${result.summary.criticalIssues}</div>
                    <div class="summary-label">${result.summary.criticalIssues === 0 ? 'Perfect!' : 'Needs Attention'}</div>
                </div>
                <div class="summary-item" style="border-left-color: #dd6b20;">
                    <h3>High Priority</h3>
                    <div class="summary-value" style="color: #dd6b20;">${result.summary.highIssues}</div>
                    <div class="summary-label">${result.summary.highIssues === 0 ? 'Great!' : 'Address Soon'}</div>
                </div>
                <div class="summary-item" style="border-left-color: var(--warning-color);">
                    <h3>Medium Priority</h3>
                    <div class="summary-value" style="color: var(--warning-color);">${result.summary.mediumIssues}</div>
                    <div class="summary-label">Improvements</div>
                </div>
                <div class="summary-item" style="border-left-color: var(--success-color);">
                    <h3>Low Priority</h3>
                    <div class="summary-value" style="color: var(--success-color);">${result.summary.lowIssues}</div>
                    <div class="summary-label">Minor Tweaks</div>
                </div>
            </div>
        </section>`;
  }

  private generateCriteriaSection(result: scoringResult): string {
    return `
        <section class="criteria-section">
            <div class="section-title">
                <h2>📈 Detailed Scoring Analysis</h2>
                <p>Comprehensive breakdown of each scoring criterion</p>
            </div>
            <div class="criteria-grid">
                ${result.criterionResults.map(criterion => this.generateCriterionCard(criterion)).join('')}
            </div>
        </section>`;
  }

  private generateCriterionCard(criterion: any): string {
    const percentage = this.calculatePercentage(criterion.score, criterion.maxScore);
    const scoreColor = this.getScoreColor(percentage);
    
    return `
                <article class="criterion-card">
                    <div class="criterion-header">
                        <h3 class="criterion-title">${this.escapeHtml(criterion.criterion)}</h3>
                        <div class="score-badge" style="background: ${scoreColor};">
                            ${criterion.score}/${criterion.maxScore}
                        </div>
                    </div>
                    
                    <div class="criterion-stats">
                        <div class="stat-item">
                            <div class="stat-label">Weight</div>
                            <div class="stat-value">${Math.round(criterion.weight * 100)}%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Weighted Score</div>
                            <div class="stat-value">${criterion.weightedScore.toFixed(1)}</div>
                        </div>
                    </div>
                    
                    <div class="progress-container">
                        <div class="progress-label">
                            <span>Score: ${percentage}%</span>
                            <span>${this.getStatusText(percentage)}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%; background: ${scoreColor};"></div>
                        </div>
                    </div>
                    
                    ${this.generateIssuesSection(criterion.issues)}
                </article>`;
  }

  private generateIssuesSection(issues: issue[]): string {
    if (issues.length === 0) {
      return `
                    <div class="no-issues">
                        Perfect Score!<br>
                        <small>No issues found in this category</small>
                    </div>`;
    }

    return `
                    <div class="issues-section">
                        <div class="issues-header">
                            <h4 class="issues-title">🔍 Issues Found</h4>
                            <span class="issues-count">${issues.length}</span>
                        </div>
                        ${issues.map(issue => this.generateIssueItem(issue)).join('')}
                    </div>`;
  }

  private generateIssueItem(issue: issue): string {
    const severityEmoji = this.getSeverityEmoji(issue.severity);
    
    return `
                        <div class="issue-item issue-${issue.severity}">
                            <div class="issue-header">
                                <span class="severity-badge severity-${issue.severity}">${issue.severity}</span>
                                <span>${severityEmoji}</span>
                            </div>
                            <div class="issue-description">
                                ${this.escapeHtml(issue.description)}
                            </div>
                            <div class="issue-location">
                                📍 ${this.escapeHtml(issue.path)}${issue.operation ? ` → ${this.escapeHtml(issue.operation)}` : ''} → ${this.escapeHtml(issue.location)}
                            </div>
                            <div class="issue-suggestion">
                                💡 <strong>Suggestion:</strong> ${this.escapeHtml(issue.suggestion)}
                            </div>
                        </div>`;
  }

  private generateFooterSection(): string {
    return `
        <footer class="footer">
            <p>🚀 Report generated by <a href="https://theneo.io" target="_blank">Theneo OpenAPI Scorer</a></p>
            <p>Visit <a href="https://theneo.io" target="_blank">theneo.io</a> for more API documentation tools</p>
            <p style="margin-top: 10px; font-size: 0.8em; opacity: 0.8;">
                Made with ❤️ by the Theneo Team | Helping developers create better APIs
            </p>
        </footer>`;
  }

  private generateScripts(): string {
    return `
    <script>
        // Add interactivity and animations
        document.addEventListener('DOMContentLoaded', function() {
            // Animate progress bars
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 300);
            });
            
            // Add click handlers for better UX
            const criterionCards = document.querySelectorAll('.criterion-card');
            criterionCards.forEach(card => {
                card.addEventListener('click', function() {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            });
            
            // Add keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (e.key === 'h' || e.key === 'H') {
                    document.querySelector('.header').scrollIntoView({ behavior: 'smooth' });
                }
                if (e.key === 's' || e.key === 'S') {
                    document.querySelector('.summary').scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            console.log('🔍 Theneo OpenAPI Scorer Report loaded successfully!');
            console.log('💡 Tip: Press "h" to scroll to header, "s" for summary');
        });
    </script>`;
  }

  private getIssueStatusText(totalIssues: number): string {
    if (totalIssues === 0) return 'Perfect!';
    if (totalIssues < 5) return 'Good';
    if (totalIssues < 15) return 'Needs Work';
    return 'Critical';
  }

  private getStatusText(percentage: number): string {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Poor';
  }

  generateMinimal(result: scoringResult, apiTitle?: string): string {
    const title = apiTitle || 'Unknown API';
    
    return `<div class="openapi-score-report">
  <h1>OpenAPI Score Report: ${this.escapeHtml(title)}</h1>
  <p><strong>Score:</strong> ${result.overallScore}/100 | <strong>Grade:</strong> ${result.grade}</p>
  <p><strong>Issues:</strong> ${result.totalIssues} total</p>
  
  <table border="1" style="width:100%; border-collapse: collapse;">
    <thead>
      <tr><th>Criterion</th><th>Score</th><th>Issues</th></tr>
    </thead>
    <tbody>
      ${result.criterionResults.map(c => {
        const percentage = this.calculatePercentage(c.score, c.maxScore);
        return `<tr><td>${this.escapeHtml(c.criterion)}</td><td>${c.score}/${c.maxScore} (${percentage}%)</td><td>${c.issues.length}</td></tr>`;
      }).join('')}
    </tbody>
  </table>
  
  <p><em>Generated by Theneo OpenAPI Scorer</em></p>
</div>`;
  }
}