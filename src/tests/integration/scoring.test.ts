import { scoringEngine } from '../../scoring/scoringEngine';
import { reportManager } from '../../reporting';

describe('OpenAPI Scoring Integration', () => {
  let scorer: scoringEngine;
  let reporter: reportManager;

  beforeEach(() => {
    scorer = new scoringEngine();
    reporter = new reportManager();
  });

  describe('Good OpenAPI Spec', () => {
    const goodSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Pet Store API',
        version: '1.0.0',
        description: 'A comprehensive pet store API'
      },
      servers: [
        { url: 'https://api.petstore.com/v1' }
      ],
      tags: [
        { name: 'pets', description: 'Pet operations' }
      ],
      paths: {
        '/pets': {
          get: {
            summary: 'List pets',
            description: 'Returns a list of pets from the store',
            tags: ['pets'],
            responses: {
              '200': {
                description: 'A list of pets',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Pet' }
                    },
                    examples: {
                      pets: {
                        value: [
                          { id: 1, name: 'Fluffy', status: 'available' }
                        ]
                      }
                    }
                  }
                }
              },
              '400': { description: 'Bad request' },
              '500': { description: 'Internal server error' }
            }
          },
          post: {
            summary: 'Create pet',
            description: 'Creates a new pet in the store',
            tags: ['pets'],
            security: [{ apiKey: [] }],
            requestBody: {
              description: 'Pet to add',
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Pet' },
                  examples: {
                    newPet: {
                      value: { name: 'Buddy', status: 'available' }
                    }
                  }
                }
              }
            },
            responses: {
              '201': { description: 'Pet created successfully' },
              '400': { description: 'Invalid input' }
            }
          }
        }
      },
      components: {
        schemas: {
          Pet: {
            type: 'object',
            required: ['name'],
            properties: {
              id: { 
                type: 'integer', 
                format: 'int64',
                description: 'Unique identifier for the pet'
              },
              name: { 
                type: 'string',
                description: 'Name of the pet'
              },
              status: {
                type: 'string',
                enum: ['available', 'pending', 'sold'],
                description: 'Pet status in the store'
              }
            }
          }
        },
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        }
      }
    } as any;

    test('should score high-quality spec well', async () => {
      const result = await scorer.scoreOpenAPISpec(goodSpec);
      
      // Updated to match your scoringResult structure
      expect(result.overallScore).toBeGreaterThan(60);
      expect(result.grade).toMatch(/A|B|C/);
      expect(result.criterionResults).toBeDefined();
      expect(Array.isArray(result.criterionResults)).toBe(true);
      expect(result.criterionResults.length).toBe(7); 
      expect(result.totalIssues).toBeGreaterThanOrEqual(0);
    });

    test('should generate comprehensive report', async () => {
      const scoreResult = scorer.scoreOpenAPISpec(goodSpec);
      const report = reporter.generateReport(await scoreResult, 'markdown', 'Pet Store API');

      expect(report).toContain('Pet Store API');
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(10);
      
      expect((await scoreResult).summary.criticalIssues).toBeLessThan(3);
    });

    test('should support multiple report formats', async () => {
      const scoreResult = scorer.scoreOpenAPISpec(goodSpec);
      
      const jsonReport = reporter.generateReport(await scoreResult, 'json', 'Pet Store API');
      const markdownReport = reporter.generateReport(await scoreResult, 'markdown', 'Pet Store API');
      const htmlReport = reporter.generateReport(await scoreResult, 'html', 'Pet Store API');

      expect(typeof jsonReport).toBe('string');
      expect(typeof markdownReport).toBe('string');
      expect(typeof htmlReport).toBe('string');
      
      // JSON should be parseable
      expect(() => JSON.parse(jsonReport)).not.toThrow();
    });
  });

  describe('Poor OpenAPI Spec', () => {
    const poorSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Bad API',
        version: '1.0.0'
      },
      paths: {
        '/stuff': {
          get: {
            // Missing description, summary, tags
            responses: {
              '200': { description: 'OK' }
            }
          },
          post: {
            responses: {
              '200': { description: 'Wrong status for POST' }
            }
          }
        }
      },
      components: {
        schemas: {
          Thing: {
            // Missing type
            properties: {
              data: {} // No type specified
            }
          }
        }
      }
    } as any;

    test('should score poor-quality spec poorly', async () => {
      const result = await scorer.scoreOpenAPISpec(poorSpec);
      
      expect(result.overallScore).toBeLessThan(70);
      expect(result.totalIssues).toBeGreaterThan(3);
      
      const criteria = result.criterionResults.map(cr => cr.criterion);
      expect(new Set(criteria).size).toBe(7); 

      const seriousIssues = result.summary.criticalIssues + result.summary.highIssues;
      expect(seriousIssues).toBeGreaterThan(0);
    });

    test('should provide actionable feedback', async () => {
      const scoreResult = await scorer.scoreOpenAPISpec(poorSpec);
      
      expect(scoreResult.criterionResults).toContainEqual(
        expect.objectContaining({
          criterion: expect.any(String),
          score: expect.any(Number),
          maxScore: expect.any(Number),
          weight: expect.any(Number),
          weightedScore: expect.any(Number),
          issues: expect.any(Array)
        })
      );
      
      // Get all issues from all criteria
      const allIssues = scoreResult.criterionResults.flatMap(cr => cr.issues);
      
      // Check that issues have suggestions
      const issuesWithSuggestions = allIssues.filter(issue => 
        issue.suggestion && issue.suggestion.length > 0
      );
      expect(issuesWithSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Scoring Engine Features', () => {
    test('should have all required analyzers', () => {
      const availableCriteria = scorer.getAvailableCriteria();
      
      expect(availableCriteria).toContain('Schema & Types');
      expect(availableCriteria).toContain('Descriptions & Documentation');
      expect(availableCriteria).toContain('Paths & Operations');
      expect(availableCriteria).toContain('Response Codes');
      expect(availableCriteria).toContain('Examples & Samples');
      expect(availableCriteria).toContain('Security');
      expect(availableCriteria).toContain('Miscellaneous Best Practices');
      
      expect(availableCriteria.length).toBe(7);
    });

    test('should validate analyzer availability', () => {
      expect(scorer.hasAnalyzer('Schema & Types')).toBe(true);
      expect(scorer.hasAnalyzer('Non-existent Analyzer')).toBe(false);
    });
  });

  describe('Report Manager Features', () => {
    test('should support all required formats', () => {
      const availableFormats = reporter.getAvailableFormats();
      
      expect(availableFormats).toContain('json');
      expect(availableFormats).toContain('markdown');
      expect(availableFormats).toContain('html');
    });

    test('should validate format support', () => {
      expect(reporter.isFormatSupported('json')).toBe(true);
      expect(reporter.isFormatSupported('markdown')).toBe(true);
      expect(reporter.isFormatSupported('html')).toBe(true);
      expect(reporter.isFormatSupported('invalid')).toBe(false);
    });

    test('should provide correct file extensions', () => {
      expect(reporter.getFileExtension('json')).toBe('json');
      expect(reporter.getFileExtension('markdown')).toBe('md');
      expect(reporter.getFileExtension('html')).toBe('html');
    });
  });

  describe('Edge Cases', () => {
    test('should handle minimal valid spec', async () => {
      const minimalSpec = {
        openapi: '3.0.0',
        info: { title: 'Minimal API', version: '1.0.0' },
        paths: {}
      } as any;

      const result = await scorer.scoreOpenAPISpec(minimalSpec);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.criterionResults.length).toBe(7);
    });

    test('should handle spec with no paths gracefully', async () => {
      const noPathsSpec = {
        openapi: '3.0.0',
        info: { title: 'No Paths API', version: '1.0.0' },
        paths: {}
      } as any;

      const result = await scorer.scoreOpenAPISpec(noPathsSpec);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(100);
      expect(result.totalIssues).toBeGreaterThan(0);
    });
  });
});