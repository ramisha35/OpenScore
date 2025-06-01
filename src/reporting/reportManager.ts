import {baseReportGenerator, htmlReportGenerator, 
    jsonReportGenerator, markdownReportGenerator} from './index'
import { scoringResult } from '../scoring/types';
import * as fs from 'fs';
import * as path from 'path';

export class reportManager {
  private generators: Map<string, baseReportGenerator>;

  constructor() {
    this.generators = new Map();
    this.initializeGenerators();
  }

  private initializeGenerators(): void {
    // 🎯 Initialize your existing generator classes
    this.generators.set('json', new jsonReportGenerator());
    this.generators.set('markdown', new markdownReportGenerator());
    this.generators.set('html', new htmlReportGenerator());
  }

  async exportReport(
    result: scoringResult,
    format: 'json' | 'markdown' | 'html' | 'all',
    outputDir: string,
    apiTitle?: string
  ): Promise<string[]> {
    const exportedFiles: string[] = [];
    
    await this.ensureDirectoryExists(outputDir);

    const formats = format === 'all' ? ['json', 'markdown', 'html'] : [format];

    for (const fmt of formats) {
      const generator = this.generators.get(fmt);
      if (!generator) {
        console.warn(`⚠️ No generator found for format: ${fmt}`);
        continue;
      }

      try {
        const fileName = generator.generateFileName(apiTitle);
        const filePath = path.join(outputDir, fileName);
        
        await generator.export(result, filePath, apiTitle);
        exportedFiles.push(filePath);

      } catch (error: any) {
        console.error(` Failed to generate ${fmt} report:`, error.message);
      }
    }

    return exportedFiles;
  }

  /**
   * Generate report content without saving to file
   */
  generateReport(
    result: scoringResult,
    format: 'json' | 'markdown' | 'html',
    apiTitle?: string
  ): string {
    const generator = this.generators.get(format);
    if (!generator) {
      throw new Error(`No generator found for format: ${format}`);
    }

    return generator.generate(result, apiTitle);
  }

  getAvailableFormats(): string[] {
    return Array.from(this.generators.keys());
  }

  isFormatSupported(format: string): boolean {
    return this.generators.has(format);
  }

  getFileExtension(format: string): string {
    const generator = this.generators.get(format);
    return generator ? generator.getFileExtension() : '';
  }

  getMimeType(format: string): string {
    const generator = this.generators.get(format);
    return generator ? generator.getMimeType() : '';
  }

  generateMultipleFormats(
    result: scoringResult,
    formats: string[],
    apiTitle?: string
  ): Record<string, string> {
    const reports: Record<string, string> = {};

    for (const format of formats) {
      if (format !== 'all' && this.isFormatSupported(format)) {
        try {
          reports[format] = this.generateReport(
            result,
            format as 'json' | 'markdown' | 'html',
            apiTitle
          );
        } catch (error: any) {
          console.warn(`Failed to generate ${format} report:`, error.message);
        }
      }
    }

    return reports;
  }

  generateExportSummary(files: string[]): string {
    let summary = `📊 Export Summary\n`;
    summary += `✅ Generated: ${files.length} file(s)\n\n`;
    
    if (files.length > 0) {
      summary += `📁 Generated Files:\n`;
      files.forEach(file => {
        const format = path.extname(file).slice(1).toUpperCase();
        summary += `  • ${format}: ${path.basename(file)}\n`;
      });
    }
    
    return summary;
  }

  async cleanupOldReports(
    outputDir: string,
    maxAge: number = 7 * 24 * 60 * 60 * 1000
  ): Promise<number> {
    if (!fs.existsSync(outputDir)) {
      return 0;
    }

    const files = await fs.promises.readdir(outputDir);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isFile() && (now - stats.mtime.getTime()) > maxAge) {
        try {
          await fs.promises.unlink(filePath);
          deletedCount++;
          console.log(`🗑️ Deleted old report: ${file}`);
        } catch (error: any) {
          console.warn(`Failed to delete ${file}:`, error.message);
        }
      }
    }

    return deletedCount;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }
}