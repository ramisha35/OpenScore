import { 
  schemaAndTypesAnalyzer, 
  descriptionsAndDocumentationAnalyzer,
  responseCodesAnalyzer, 
  examplesAndSamplesAnalyzer, 
  securityAnalyzer, 
  miscellaneousBestPracticesAnalyzer, 
  pathsAndOperationsAnalyzer
} from '../../analyzers/index';

describe('SchemaAndTypesAnalyzer', () => {
  const analyzer = new schemaAndTypesAnalyzer();

  test('should give full points for properly typed schemas', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {},
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBe(20);
    expect(result.issues).toHaveLength(0);
  });

  test('should deduct points for schemas without types', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {},
      components: {
        schemas: {
          BadSchema: {
            properties: {
              data: {} 
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeLessThan(20);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        severity: expect.stringMatching(/high|medium/),
        description: expect.stringContaining('type definition')
      })
    );
  });
});

describe('DescriptionsAndDocumentationAnalyzer', () => {
  const analyzer = new descriptionsAndDocumentationAnalyzer();

  test('should give good score when endpoints have descriptions', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            description: 'Retrieve a list of all users',
            responses: {
              '200': {
                description: 'Successful response'
              }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeGreaterThanOrEqual(15);
  });

  test('should deduct points for missing descriptions', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK'
              }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeLessThan(20);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('ResponseCodesAnalyzer', () => {
  const analyzer = new responseCodesAnalyzer();

  test('should give good score for proper HTTP status codes', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': { description: 'Success' },
              '400': { description: 'Bad Request' },
              '404': { description: 'Not Found' },
              '500': { description: 'Internal Server Error' }
            }
          },
          post: {
            responses: {
              '201': { description: 'Created' },
              '400': { description: 'Bad Request' }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeGreaterThanOrEqual(14);
  });

  test('should flag missing error codes', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '201': { description: 'Wrong code for GET' }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeLessThan(15);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        severity: expect.stringMatching(/medium|low/),
        description: expect.stringContaining('error')
      })
    );
  });
});

describe('ExamplesAndSamplesAnalyzer', () => {
  const analyzer = new examplesAndSamplesAnalyzer();

  test('should give points when endpoints have examples', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array' },
                    examples: {
                      userList: {
                        value: [{ id: 1, name: 'John' }]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should deduct points for missing examples', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeLessThan(10);
  });
});

describe('SecurityAnalyzer', () => {
  const analyzer = new securityAnalyzer();

  test('should give points for defined security schemes', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/protected': {
          get: {
            security: [{ apiKey: [] }],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should flag missing security for sensitive operations', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          post: {
            responses: {
              '201': { description: 'Created' }
            }
          },
          delete: {
            responses: {
              '204': { description: 'Deleted' }
            }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        severity: expect.stringMatching(/high|medium/),
        description: expect.stringContaining('security')
      })
    );
  });
});

describe('PathsAndOperationsAnalyzer', () => {
  const analyzer = new pathsAndOperationsAnalyzer();

  test('should approve RESTful path conventions', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/users': {
          get: { 
            operationId: 'getUsers',
            responses: { '200': { description: 'Success' } }
          },
          post: { 
            operationId: 'createUser',
            responses: { '201': { description: 'Created' } }
          }
        },
        '/users/{id}': {
          get: { 
            operationId: 'getUserById',
            responses: { '200': { description: 'Success' } }
          },
          put: { 
            operationId: 'updateUser',
            responses: { '200': { description: 'Updated' } }
          },
          delete: { 
            operationId: 'deleteUser',
            responses: { '204': { description: 'Deleted' } }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeGreaterThan(10);
  });

  test('should flag naming convention issues', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/getUsers': {
          get: {
            responses: { '200': { description: 'Success' } }
          }
        },
        '/createUser': {
          post: {
            responses: { '201': { description: 'Created' } }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        description: expect.stringContaining('naming convention')
      })
    );
  });
});

describe('MiscellaneousBestPracticesAnalyzer', () => {
  const analyzer = new miscellaneousBestPracticesAnalyzer();

  test('should give points for following best practices', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.2.0',
        description: 'A well-documented API'
      },
      servers: [
        { url: 'https://api.example.com/v1' }
      ],
      tags: [
        { name: 'users', description: 'User operations' }
      ],
      paths: {
        '/users': {
          get: { 
            tags: ['users'],
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should deduct points for missing best practices', () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Basic API',
        version: '1.0.0'
      },
      paths: {
        '/endpoint': {
          get: {
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    } as any;

    const result = analyzer.analyze(spec);
    expect(result.score).toBeLessThan(10);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});