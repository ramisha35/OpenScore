import { scoringResult, issue } from '../scoring/types';
import * as fs from 'fs';
import * as path from 'path';

export abstract class baseReportGenerator {
  protected readonly fileExtension: string;
  protected readonly mimeType: string;

  constructor(fileExtension: string, mimeType: string) {
    this.fileExtension = fileExtension;
    this.mimeType = mimeType;
  }

  abstract generate(result: scoringResult, apiTitle?: string): string;

  async export(result: scoringResult, filePath: string, apiTitle?: string): Promise<void> {
    const content = this.generate(result, apiTitle);

    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    
    await fs.promises.writeFile(filePath, content, 'utf-8');
    console.log(`${this.getTypeName()} report exported to: ${filePath}`);
  }

  generateFileName(apiTitle?: string, timestamp?: Date): string {
    const cleanTitle = this.sanitizeFileName(apiTitle || 'openapi-report');
    const timeStr = (timestamp || new Date()).toISOString().slice(0, 19).replace(/:/g, '-');
    return `${cleanTitle}-${timeStr}.${this.fileExtension}`;
  }

  getFileExtension(): string {
    return this.fileExtension;
  }


  getMimeType(): string {
    return this.mimeType;
  }


  abstract getTypeName(): string;

  protected getScoreColor(score: number): string {
    if (score >= 90) return '#38a169'; 
    if (score >= 70) return '#d69e2e'; 
    if (score >= 50) return '#dd6b20';  
    return '#e53e3e';                   
  }


  protected getScoreEmoji(percentage: number): string {
    if (percentage >= 90) return '🟢';
    if (percentage >= 70) return '🟡';
    if (percentage >= 50) return '🟠';
    return '🔴';
  }


  protected getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  protected getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }


  protected calculatePercentage(score: number, maxScore: number): number {
    return Math.round((score / maxScore) * 100);
  }


  protected groupIssuesBySeverity(issues: issue[]): Record<string, issue[]> {
    return issues.reduce((groups, issue) => {
      const severity = issue.severity;
      if (!groups[severity]) {
        groups[severity] = [];
      }
      groups[severity].push(issue);
      return groups;
    }, {} as Record<string, issue[]>);
  }


  protected getFormattedTimestamp(): string {
    return new Date().toLocaleString();
  }

  protected sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }


  protected escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }


  protected escapeMarkdown(text: string): string {
    return text.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
  }


  protected truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  protected getGradeDescription(grade: string): string {
    switch (grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Good';
      case 'C': return 'Average';
      case 'D': return 'Below Average';
      case 'F': return 'Poor';
      default: return 'Unknown';
    }
  }

  protected generateMetadata(apiTitle?: string) {
    return {
      timestamp: new Date().toISOString(),
      apiTitle: apiTitle || 'Unknown API',
      generator: 'Theneo OpenAPI Scorer',
      version: '1.0.0'
    };
  }
}