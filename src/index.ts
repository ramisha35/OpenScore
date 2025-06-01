import { Command, Option } from 'commander';
import { OpenAPIInputHandler } from './parser/openAPIInputHandler';
import { scoringEngine } from './scoring/scoringEngine';
import { reportManager } from './reporting/reportManager';
import * as path from 'path';
import * as fs from 'fs';

interface CLIOptions {
  input: string;
  output?: string;
  format?: 'json' | 'markdown' | 'html' | 'all';
  verbose?: boolean;
  failOnScore?: number;
  severityThreshold?: 'low' | 'medium' | 'high' | 'critical';
  quiet?: boolean;
  noColor?: boolean;
}

class OpenAPIScorer {
  private inputHandler: OpenAPIInputHandler;
  private scoringEngine: scoringEngine;
  private reportManager: reportManager;

  constructor() {
    this.inputHandler = new OpenAPIInputHandler();
    this.scoringEngine = new scoringEngine();
    this.reportManager = new reportManager();
  }

  async scoreAPI(options: CLIOptions): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Theneo OpenAPI Scorer');
      console.log('='.repeat(50));
      
      console.log(`📄 Loading OpenAPI specification from: ${options.input}`);
      const document = await this.inputHandler.handleInput(options.input);
      
      console.log('🔬 Analyzing specification...');
      const result = await this.scoringEngine.scoreOpenAPISpec(document);
      
      const outputDir = options.output || './reports';
      const format = options.format || 'all';
      const apiTitle = document.info?.title || 'Unknown API';
      
      console.log(`📊 Generating ${format} report(s)...`);
      const exportedFiles = await this.reportManager.exportReport(
        result,
        format,
        outputDir,
        apiTitle
      );
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('\n' + '='.repeat(50));
      console.log('🎯 SCORING RESULTS');
      console.log('='.repeat(50));
      console.log(`API: ${apiTitle}`);
      console.log(`Overall Score: ${result.overallScore}/100 (Grade: ${result.grade})`);
      console.log(`Total Issues: ${result.totalIssues}`);
      console.log(`  Critical: ${result.summary.criticalIssues}`);
      console.log(`  High: ${result.summary.highIssues}`);
      console.log(`  Medium: ${result.summary.mediumIssues}`);
      console.log(`  Low: ${result.summary.lowIssues}`);
      
      console.log('\n📈 CRITERION BREAKDOWN');
      console.log('-'.repeat(50));
      result.criterionResults.forEach(criterion => {
        const percentage = Math.round((criterion.score / criterion.maxScore) * 100);
        const status = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌';
        console.log(`${status} ${criterion.criterion}: ${criterion.score}/${criterion.maxScore} (${percentage}%)`);
      });
      
      console.log('\n📁 EXPORTED REPORTS');
      console.log('-'.repeat(50));
      exportedFiles.forEach(file => {
        console.log(`📄 ${path.basename(file)}`);
        console.log(`   ${path.resolve(file)}`);
      });
      
      console.log(`\n⏱️ Analysis completed in ${duration}s`);
      
      if (options.verbose && result.totalIssues > 0) {
        console.log('\n🔍 DETAILED ISSUES');
        console.log('-'.repeat(50));
        
        const severityOrder = ['critical', 'high', 'medium', 'low'];
        const thresholdIndex = options.severityThreshold ? 
          severityOrder.indexOf(options.severityThreshold) : 3;
        
        result.criterionResults.forEach(criterion => {
          const filteredIssues = criterion.issues.filter(issue => 
            severityOrder.indexOf(issue.severity) <= thresholdIndex
          );
          
          if (filteredIssues.length > 0) {
            console.log(`\n${criterion.criterion}:`);
            filteredIssues.forEach(issue => {
              const severityEmoji = this.getSeverityEmoji(issue.severity);
              console.log(`  ${severityEmoji} ${issue.description}`);
              console.log(`     Location: ${issue.path}${issue.operation ? ` > ${issue.operation}` : ''} > ${issue.location}`);
              console.log(`     Suggestion: ${issue.suggestion}`);
            });
          }
        });
      }
      
      if (options.failOnScore && result.overallScore < options.failOnScore) {
        console.log(`\n❌ Score ${result.overallScore} is below threshold ${options.failOnScore}`);
        process.exit(1);
      } else if (result.overallScore < 60) {
        console.log('\n⚠️  Warning: Score below 60. Consider addressing critical issues.');
        process.exit(1);
      } else if (result.summary.criticalIssues > 0) {
        console.log('\n⚠️  Warning: Critical issues found.');
        process.exit(1);
      }
      
    } catch (error: any) {
      console.error('\n❌ Error:', error.message);
      if (options.verbose) {
        console.error('Stack trace:', error.stack);
      }
      process.exit(1);
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }
}

const program = new Command();

program
  .name('openapi-scorer')
  .description('🔍 Theneo OpenAPI Specification Scorer - Analyze and score OpenAPI specs against industry best practices')
  .version('1.0.0');

program
  .command('score')
  .description('🎯 Score an OpenAPI specification against industry best practices')
  .requiredOption('-i, --input <path>', 'Path to OpenAPI spec file or URL')
  .option('-o, --output <dir>', 'Output directory for reports', './reports')
  .option('-f, --format <format>', 'Report format: json, markdown, html, or all', 'all')
  .option('-v, --verbose', 'Show detailed output including all issues')
  .addOption(new Option('--fail-on-score <score>', 'Exit with code 1 if score is below threshold').argParser(parseInt))
  .addOption(new Option('--severity-threshold <level>', 'Only show issues at or above this severity').choices(['low', 'medium', 'high', 'critical']))
  .action(async (options: CLIOptions & { failOnScore?: number; severityThreshold?: string }) => {
    const scorer = new OpenAPIScorer();
    await scorer.scoreAPI(options);
  });

program
  .command('example')
  .alias('demo')
  .description('🚀 Run with example Petstore OpenAPI specification')
  .option('-o, --output <dir>', 'Output directory for reports', './reports')
  .option('-f, --format <format>', 'Report format: json, markdown, html, or all', 'all')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    const exampleSpec = 'https://petstore3.swagger.io/api/v3/openapi.json';
    console.log(`🔗 Using example spec: ${exampleSpec}`);
    
    const scorer = new OpenAPIScorer();
    await scorer.scoreAPI({
      input: exampleSpec,
      output: options.output,
      format: options.format,
      verbose: options.verbose
    });
  });

program
  .command('validate')
  .alias('check')
  .description('✅ Validate an OpenAPI specification without scoring')
  .requiredOption('-i, --input <path>', 'Path to OpenAPI spec file or URL')
  .option('--strict', 'Enable strict validation mode')
  .action(async (options) => {
    try {
      console.log('🔍 Validating OpenAPI specification...');
      const handler = new OpenAPIInputHandler();
      const document = await handler.handleInput(options.input);
      
      console.log('✅ Specification is valid!');
      console.log(`📝 Title: ${document.info?.title || 'N/A'}`);
      console.log(`🔢 Version: ${document.info?.version || 'N/A'}`);
      console.log(`🛣️  Endpoints: ${Object.keys(document.paths || {}).length}`);
      
      if (document.info?.description) {
        console.log(`📖 Description: ${document.info.description.slice(0, 100)}${document.info.description.length > 100 ? '...' : ''}`);
      }
    } catch (error: any) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

program
  .option('--no-color', 'Disable colored output')
  .option('--quiet', 'Suppress all output except errors')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.quiet) {
      console.log = () => {};
    }
  });

program
  .command('examples')
  .alias('help-examples')
  .description('📚 Show detailed usage examples and best practices')
  .action(() => {
    console.log(`
🔍 Theneo OpenAPI Scorer - Detailed Examples

BASIC USAGE
  openapi-scorer score -i ./api-spec.yaml
  openapi-scorer demo
  openapi-scorer validate -i ./spec.json

ADVANCED SCORING
  openapi-scorer score -i ./spec.yaml -f html -o ./reports -v
  openapi-scorer score -i https://api.example.com/openapi.json --fail-on-score 80
  openapi-scorer score -i ./spec.yaml --severity-threshold high

REPORT FORMATS
  openapi-scorer score -i ./spec.yaml -f json
  openapi-scorer score -i ./spec.yaml -f markdown
  openapi-scorer score -i ./spec.yaml -f html
  openapi-scorer score -i ./spec.yaml -f all

CI/CD INTEGRATION
  openapi-scorer score -i ./api.yaml --fail-on-score 80 --quiet
  openapi-scorer score -i ./api.yaml --severity-threshold high

SCORE INTERPRETATION
  90-100: Grade A (Excellent) ✅
  80-89:  Grade B (Good) ✅  
  70-79:  Grade C (Average) ⚠️
  60-69:  Grade D (Poor) ⚠️
  0-59:   Grade F (Failing) ❌

For more information, visit: https://theneo.io
    `);
  });

program
  .command('completion')
  .description('🔧 Generate shell completion scripts')
  .option('--shell <shell>', 'Shell type (bash, zsh, fish)', 'bash')
  .action((options) => {
    console.log(`# Add this to your ${options.shell} profile:`);
    console.log(`# For ${options.shell}:`);
    switch (options.shell) {
      case 'bash':
        console.log('eval "$(openapi-scorer completion --shell bash)"');
        break;
      case 'zsh':
        console.log('eval "$(openapi-scorer completion --shell zsh)"');
        break;
      case 'fish':
        console.log('openapi-scorer completion --shell fish | source');
        break;
      default:
        console.log('Unsupported shell. Supported: bash, zsh, fish');
    }
  });

if (require.main === module) {
  program.parse();
}

export { OpenAPIScorer, CLIOptions };