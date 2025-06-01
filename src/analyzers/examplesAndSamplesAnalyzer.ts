import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';
import { baseAnalyzer } from './baseAnalyzer';
import { scoringConfiguration } from '../scoring/scoringConfiguration';

export class examplesAndSamplesAnalyzer extends baseAnalyzer {
  private readonly CRITERION_NAME = 'Examples & Samples';

  analyze(document: OpenAPIV3.Document): criterionResult {
    const issues: issue[] = [];
    const criterion = scoringConfiguration.getCriterionByName(this.CRITERION_NAME)!;
    
    if (document.paths) {
      this.checkPathExamples(document.paths, issues);
    }
    
    if (document.components) {
      this.checkComponentExamples(document.components, issues);
    }
    
    const score = this.calculateScore(
      issues, 
      this.countCheckableItems(document), 
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
  
  private countCheckableItems(document: OpenAPIV3.Document): number {
    let count = 0;
    
    if (document.paths) {
      for (const path in document.paths) {
        const pathItem = document.paths[path] as OpenAPIV3.PathItemObject;
        const operations = this.getOperations(pathItem);
        
        for (const operation of operations) {
          const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
          
          if (operationObj.requestBody) {
            count++;
          }
          
          if (operationObj.responses) {
            for (const statusCode in operationObj.responses) {
              if (statusCode.startsWith('2')) {
                count++;
              }
            }
          }
        }
      }
    }
    
    if (document.components?.schemas) {
      count += Object.keys(document.components.schemas).length;
    }
    
    return count;
  }
  
  private getOperations(pathItem: OpenAPIV3.PathItemObject): string[] {
    return ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace']
      .filter(op => pathItem[op as keyof OpenAPIV3.PathItemObject]);
  }
  
  private checkPathExamples(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    for (const path in paths) {
      const pathItem = paths[path] as OpenAPIV3.PathItemObject;
      const operations = this.getOperations(pathItem);
      
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        if (operationObj.requestBody) {
          this.checkRequestBodyExamples(path, operation, operationObj.requestBody, issues);
        }
        
        if (operationObj.responses) {
          this.checkResponseExamples(path, operation, operationObj.responses, issues);
        }
        
        if (operationObj.parameters) {
          this.checkParameterExamples(path, operation, operationObj.parameters, issues);
        }
      }
    }
  }
  
  private checkRequestBodyExamples(
    path: string, 
    operation: string, 
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject, 
    issues: issue[]
  ): void {
    if ('$ref' in requestBody) return;
    
    const requestBodyObj = requestBody as OpenAPIV3.RequestBodyObject;
    
    if (requestBodyObj.content) {
      let hasExample = false;
      
      for (const mediaType in requestBodyObj.content) {
        const content = requestBodyObj.content[mediaType];
        
        if (content.example || content.examples || 
            (content.schema && (
              ('example' in content.schema) || 
              ('examples' in content.schema)
            ))) {
          hasExample = true;
          break;
        }
      }
      
      if (!hasExample) {
        const severity = ['post', 'put', 'patch'].includes(operation) ? 'high' : 'medium';
        
        issues.push(this.createIssue(
          path,
          operation,
          'requestBody',
          `Request body for ${operation.toUpperCase()} ${path} lacks examples`,
          severity,
          'Add examples to illustrate expected request format',
          this.CRITERION_NAME
        ));
      }
    }
  }
  
  private checkResponseExamples(
    path: string, 
    operation: string, 
    responses: OpenAPIV3.ResponsesObject, 
    issues: issue[]
  ): void {
    for (const statusCode in responses) {
      if (!statusCode.startsWith('2')) continue;
      
      const response = responses[statusCode];
      
      if ('$ref' in response) continue;
      
      const responseObj = response as OpenAPIV3.ResponseObject;
      
      if (responseObj.content) {
        let hasExample = false;
        
        for (const mediaType in responseObj.content) {
          const content = responseObj.content[mediaType];
          
          if (content.example || content.examples || 
              (content.schema && (
                ('example' in content.schema) || 
                ('examples' in content.schema)
              ))) {
            hasExample = true;
            break;
          }
        }
        
        if (!hasExample) {
          issues.push(this.createIssue(
            path,
            operation,
            `responses.${statusCode}`,
            `Response ${statusCode} for ${operation.toUpperCase()} ${path} lacks examples`,
            'medium',
            'Add examples to illustrate expected response format',
            this.CRITERION_NAME
          ));
        }
      }
    }
  }
  
  private checkParameterExamples(
    path: string, 
    operation: string, 
    parameters: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>, 
    issues: issue[]
  ): void {
    for (const param of parameters) {
      if ('$ref' in param) continue;
      
      const paramObj = param as OpenAPIV3.ParameterObject;
      
      if (paramObj.required && 
          !paramObj.example && 
          !paramObj.examples && 
          paramObj.schema && 
          !('example' in paramObj.schema) && 
          !('examples' in paramObj.schema)) {
        
        issues.push(this.createIssue(
          path,
          operation,
          `parameters.${paramObj.name}`,
          `Required parameter "${paramObj.name}" (in ${paramObj.in}) lacks examples`,
          'low',
          'Add an example to help consumers understand expected parameter values',
          this.CRITERION_NAME
        ));
      }
    }
  }
  
  private checkComponentExamples(components: OpenAPIV3.ComponentsObject, issues: issue[]): void {
    if (components.schemas) {
      for (const schemaName in components.schemas) {
        const schema = components.schemas[schemaName];
        
        if ('$ref' in schema) continue;
        
        const schemaObj = schema as OpenAPIV3.SchemaObject;
        
        if ((schemaObj.type === 'object' || schemaObj.type === 'array' || !schemaObj.type) && 
            !schemaObj.example) {
          
          issues.push(this.createIssue(
            'components/schemas',
            undefined,
            schemaName,
            `Schema "${schemaName}" lacks examples`,
            'medium',
            'Add examples to illustrate valid schema values',
            this.CRITERION_NAME
          ));
        }
      }
    }
    
    if (components.requestBodies) {
      for (const requestBodyName in components.requestBodies) {
        const requestBody = components.requestBodies[requestBodyName];
        
        if ('$ref' in requestBody) continue;
        
        const requestBodyObj = requestBody as OpenAPIV3.RequestBodyObject;
        
        if (requestBodyObj.content) {
          let hasExample = false;
          
          for (const mediaType in requestBodyObj.content) {
            const content = requestBodyObj.content[mediaType];
            
            if (content.example || content.examples || 
                (content.schema && (
                  ('example' in content.schema) || 
                  ('examples' in content.schema)
                ))) {
              hasExample = true;
              break;
            }
          }
          
          if (!hasExample) {
            issues.push(this.createIssue(
              'components/requestBodies',
              undefined,
              requestBodyName,
              `Request body "${requestBodyName}" lacks examples`,
              'medium',
              'Add examples to illustrate expected request format',
              this.CRITERION_NAME
            ));
          }
        }
      }
    }
    
    if (components.responses) {
      for (const responseName in components.responses) {
        const response = components.responses[responseName];
        
        if ('$ref' in response) continue;
        
        const responseObj = response as OpenAPIV3.ResponseObject;
        
        if (responseObj.content) {
          let hasExample = false;
          
          for (const mediaType in responseObj.content) {
            const content = responseObj.content[mediaType];
            
            if (content.example || content.examples || 
                (content.schema && (
                  ('example' in content.schema) || 
                  ('examples' in content.schema)
                ))) {
              hasExample = true;
              break;
            }
          }
          
          if (!hasExample) {
            issues.push(this.createIssue(
              'components/responses',
              undefined,
              responseName,
              `Response "${responseName}" lacks examples`,
              'medium',
              'Add examples to illustrate expected response format',
              this.CRITERION_NAME
            ));
          }
        }
      }
    }
    
    if (components.parameters) {
      for (const paramName in components.parameters) {
        const param = components.parameters[paramName];
        
        if ('$ref' in param) continue;
        
        const paramObj = param as OpenAPIV3.ParameterObject;
        
        if (paramObj.required && 
            !paramObj.example && 
            !paramObj.examples && 
            paramObj.schema && 
            !('example' in paramObj.schema) && 
            !('examples' in paramObj.schema)) {
          
          issues.push(this.createIssue(
            'components/parameters',
            undefined,
            paramName,
            `Required parameter "${paramName}" lacks examples`,
            'low',
            'Add an example to help consumers understand expected parameter values',
            this.CRITERION_NAME
          ));
        }
      }
    }
  }
}