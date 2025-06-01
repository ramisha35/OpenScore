import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';
import { baseAnalyzer } from './baseAnalyzer';
import { scoringConfiguration } from '../scoring/scoringConfiguration';

export class miscellaneousBestPracticesAnalyzer extends baseAnalyzer {
  private readonly CRITERION_NAME = 'Miscellaneous Best Practices';

  analyze(document: OpenAPIV3.Document): criterionResult {
    const issues: issue[] = [];
    const criterion = scoringConfiguration.getCriterionByName(this.CRITERION_NAME)!;
    
    this.checkApiInfo(document, issues);
    this.checkServers(document, issues);
    this.checkTags(document, issues);
    
    if (document.components && document.paths) {
      this.checkComponentsReuse(document, issues);
    }
    
    const score = this.calculateScore(
      issues, 
      10, 
      criterion.maxScore
    );
    
    return {
      criterion: this.CRITERION_NAME,
      score,
      maxScore: criterion.maxScore,
      weight: criterion.weight,
      weightedScore: score * criterion.weight,
      issues
    };
  }
  
  private getOperations(pathItem: OpenAPIV3.PathItemObject): string[] {
    return ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace']
      .filter(op => pathItem[op as keyof OpenAPIV3.PathItemObject]);
  }
  
  private checkApiInfo(document: OpenAPIV3.Document, issues: issue[]): void {
    if (!document.info.version) {
      issues.push(this.createIssue(
        'info',
        undefined,
        'version',
        'API version is not specified',
        'high',
        'Add a version following semantic versioning (e.g., 1.0.0)',
        this.CRITERION_NAME
      ));
    } else if (!document.info.version.match(/^\d+\.\d+\.\d+$/)) {
      issues.push(this.createIssue(
        'info',
        undefined,
        'version',
        `API version "${document.info.version}" does not follow semantic versioning`,
        'low',
        'Use semantic versioning (MAJOR.MINOR.PATCH) for the API version',
        this.CRITERION_NAME
      ));
    }
    
    if (!document.info.license) {
      issues.push(this.createIssue(
        'info',
        undefined,
        'license',
        'License information is missing',
        'low',
        'Add license information to help API consumers understand usage terms',
        this.CRITERION_NAME
      ));
    } else if (!document.info.license.name) {
      issues.push(this.createIssue(
        'info',
        undefined,
        'license.name',
        'License name is missing',
        'low',
        'Specify the license name',
        this.CRITERION_NAME
      ));
    }
    
    if (!document.info.termsOfService) {
      issues.push(this.createIssue(
        'info',
        undefined,
        'termsOfService',
        'Terms of service URL is missing',
        'low',
        'Add a terms of service URL to help API consumers understand usage terms',
        this.CRITERION_NAME
      ));
    }
  }
  
  private checkServers(document: OpenAPIV3.Document, issues: issue[]): void {
    if (!document.servers || document.servers.length === 0) {
      issues.push(this.createIssue(
        'root',
        undefined,
        'servers',
        'No servers defined in the API',
        'medium',
        'Add at least one server URL to help consumers understand where the API is deployed',
        this.CRITERION_NAME
      ));
    } else {
      document.servers.forEach((server, index) => {
        if (!server.url) {
          issues.push(this.createIssue(
            'servers',
            undefined,
            `[${index}]`,
            'Server URL is missing',
            'medium',
            'Add a valid URL for the server',
            this.CRITERION_NAME
          ));
        } else if (!server.description) {
          issues.push(this.createIssue(
            'servers',
            undefined,
            `[${index}]`,
            'Server description is missing',
            'low',
            'Add a description to help consumers understand the server purpose (e.g., production, staging)',
            this.CRITERION_NAME
          ));
        }
      });
    }
  }
  
  private checkTags(document: OpenAPIV3.Document, issues: issue[]): void {
    if (!document.tags || document.tags.length === 0) {
      issues.push(this.createIssue(
        'root',
        undefined,
        'tags',
        'No tags defined in the API',
        'medium',
        'Define tags to group operations by resources or functionality',
        this.CRITERION_NAME
      ));
    } else {
      document.tags.forEach((tag, index) => {
        if (!tag.description) {
          issues.push(this.createIssue(
            'tags',
            undefined,
            `[${index}]`,
            `Tag "${tag.name}" has no description`,
            'low',
            'Add a description to explain the tag purpose',
            this.CRITERION_NAME
          ));
        }
      });
    }
    
    if (document.paths) {
      const taggedOperations = new Set<string>();
      const totalOperations = new Set<string>();
      
      for (const path in document.paths) {
        const pathItem = document.paths[path] as OpenAPIV3.PathItemObject;
        const operations = this.getOperations(pathItem);
        
        for (const operation of operations) {
          const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
          const operationId = `${path}:${operation}`;
          
          totalOperations.add(operationId);
          
          if (operationObj.tags && operationObj.tags.length > 0) {
            taggedOperations.add(operationId);
          }
        }
      }
      
      if (taggedOperations.size < totalOperations.size) {
        issues.push(this.createIssue(
          'paths',
          undefined,
          'operations',
          `${totalOperations.size - taggedOperations.size} operations are not tagged`,
          'medium',
          'Add tags to all operations for better organization',
          this.CRITERION_NAME
        ));
      }
    }
  }
  
  private checkComponentsReuse(document: OpenAPIV3.Document, issues: issue[]): void {
    const componentRefs: Record<string, number> = {};
    const inlineSchemaCount = { count: 0 };
    
    if (document.components) {
      if (document.components.schemas) {
        Object.keys(document.components.schemas).forEach(name => {
          componentRefs[`#/components/schemas/${name}`] = 0;
        });
      }
      
      if (document.components.parameters) {
        Object.keys(document.components.parameters).forEach(name => {
          componentRefs[`#/components/parameters/${name}`] = 0;
        });
      }
      
      if (document.components.requestBodies) {
        Object.keys(document.components.requestBodies).forEach(name => {
          componentRefs[`#/components/requestBodies/${name}`] = 0;
        });
      }
      
      if (document.components.responses) {
        Object.keys(document.components.responses).forEach(name => {
          componentRefs[`#/components/responses/${name}`] = 0;
        });
      }
    }
    
    for (const path in document.paths) {
      const pathItem = document.paths[path] as OpenAPIV3.PathItemObject;
      
      if (pathItem.parameters) {
        this.countReferences(pathItem.parameters, componentRefs, inlineSchemaCount);
      }
      
      const operations = this.getOperations(pathItem);
      
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        if (operationObj.parameters) {
          this.countReferences(operationObj.parameters, componentRefs, inlineSchemaCount);
        }
        
        if (operationObj.requestBody) {
          if ('$ref' in operationObj.requestBody) {
            const ref = operationObj.requestBody.$ref;
            if (componentRefs[ref] !== undefined) {
              componentRefs[ref]++;
            }
          } else {
            inlineSchemaCount.count++;
            
            const requestBody = operationObj.requestBody as OpenAPIV3.RequestBodyObject;
            if (requestBody.content) {
              for (const mediaType in requestBody.content) {
                if (requestBody.content[mediaType]?.schema) {
                  this.countSchemaReferences(requestBody.content[mediaType]?.schema, componentRefs, inlineSchemaCount);
                }
              }
            }
          }
        }
        
        if (operationObj.responses) {
          for (const statusCode in operationObj.responses) {
            const response = operationObj.responses[statusCode];
            
            if ('$ref' in response) {
              const ref = response.$ref;
              if (componentRefs[ref] !== undefined) {
                componentRefs[ref]++;
              }
            } else {
              inlineSchemaCount.count++;
              
              const responseObj = response as OpenAPIV3.ResponseObject;
              if (responseObj.content) {
                for (const mediaType in responseObj.content) {
                  if (responseObj.content[mediaType]?.schema) {
                    this.countSchemaReferences(responseObj.content[mediaType]?.schema, componentRefs, inlineSchemaCount);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    const unusedComponents = Object.keys(componentRefs).filter(ref => componentRefs[ref] === 0);
    
    if (unusedComponents.length > 0) {
      issues.push(this.createIssue(
        'components',
        undefined,
        '',
        `${unusedComponents.length} component definitions are unused`,
        'low',
        'Remove unused component definitions or ensure they are referenced properly',
        this.CRITERION_NAME
      ));
    }
    
    if (inlineSchemaCount.count > 10) {
      issues.push(this.createIssue(
        'paths',
        undefined,
        '',
        `Found ${inlineSchemaCount.count} inline schemas that could be reused`,
        'medium',
        'Move common schemas to components/schemas for better reusability',
        this.CRITERION_NAME
      ));
    }
  }
  
  private countReferences(
    items: Array<any>, 
    componentRefs: Record<string, number>, 
    inlineSchemaCount: { count: number }
  ): void {
    items.forEach(item => {
      if ('$ref' in item) {
        const ref = item.$ref;
        if (componentRefs[ref] !== undefined) {
          componentRefs[ref]++;
        }
      } else {
        inlineSchemaCount.count++;
        
        if (item.schema) {
          this.countSchemaReferences(item.schema, componentRefs, inlineSchemaCount);
        }
      }
    });
  }
  
  private countSchemaReferences(
    schema: any, 
    componentRefs: Record<string, number>, 
    inlineSchemaCount: { count: number }
  ): void {
    if (!schema) return;
    
    if ('$ref' in schema) {
      const ref = schema.$ref;
      if (componentRefs[ref] !== undefined) {
        componentRefs[ref]++;
      }
      return;
    }
    
    if (schema.properties) {
      for (const propName in schema.properties) {
        this.countSchemaReferences(schema.properties[propName], componentRefs, inlineSchemaCount);
      }
    }
    
    if (schema.items) {
      this.countSchemaReferences(schema.items, componentRefs, inlineSchemaCount);
    }
    
    ['allOf', 'oneOf', 'anyOf'].forEach(key => {
      if (schema[key] && Array.isArray(schema[key])) {
        schema[key].forEach((subSchema: any) => {
          this.countSchemaReferences(subSchema, componentRefs, inlineSchemaCount);
        });
      }
    });
  }
}