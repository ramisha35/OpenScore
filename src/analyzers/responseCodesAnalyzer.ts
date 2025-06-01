import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';
import { baseAnalyzer } from './baseAnalyzer';
import { scoringConfiguration } from '../scoring/scoringConfiguration';

export class responseCodesAnalyzer extends baseAnalyzer {
  private readonly CRITERION_NAME = 'Response Codes';

  analyze(document: OpenAPIV3.Document): criterionResult {
    const issues: issue[] = [];
    const criterion = scoringConfiguration.getCriterionByName(this.CRITERION_NAME)!;
    
    if (document.paths) {
      this.checkResponseCodes(document.paths, issues);
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
        count += operations.length;
      }
    }
    
    return count;
  }
  
  private getOperations(pathItem: OpenAPIV3.PathItemObject): string[] {
    return ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace']
      .filter(op => pathItem[op as keyof OpenAPIV3.PathItemObject]);
  }
  
  private checkResponseCodes(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    for (const path in paths) {
      const pathItem = paths[path] as OpenAPIV3.PathItemObject;
      const operations = this.getOperations(pathItem);
      
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        if (!operationObj.responses || Object.keys(operationObj.responses).length === 0) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            'Operation has no defined responses',
            'critical',
            'Define at least success (2xx) and error (4xx/5xx) responses',
            this.CRITERION_NAME
          ));
          continue;
        }
        
        const successCodes = Object.keys(operationObj.responses).filter(
          code => code.startsWith('2') || code === 'default'
        );
        
        if (successCodes.length === 0) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            'Operation is missing success response codes (2xx)',
            'high',
            'Add appropriate success response codes (e.g., 200, 201, 204)',
            this.CRITERION_NAME
          ));
        }
        const clientErrorCodes = Object.keys(operationObj.responses).filter(
          code => code.startsWith('4')
        );
        
        const serverErrorCodes = Object.keys(operationObj.responses).filter(
          code => code.startsWith('5')
        );
        
        if (clientErrorCodes.length === 0) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            'Operation is missing client error response codes (4xx)',
            'medium',
            'Add appropriate client error response codes (e.g., 400, 401, 404)',
            this.CRITERION_NAME
          ));
        }
        
        if (serverErrorCodes.length === 0 && !Object.keys(operationObj.responses).includes('default')) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            'Operation is missing server error handling (5xx or default)',
            'low',
            'Add server error responses (5xx) or a default response',
            this.CRITERION_NAME
          ));
        }
        
        this.checkOperationSpecificStatusCodes(path, operation, operationObj, issues);
        
        this.checkResponseConsistency(path, operation, operationObj.responses, issues);
      }
    }
  }
  
  private checkOperationSpecificStatusCodes(
    path: string, 
    operation: string, 
    operationObj: OpenAPIV3.OperationObject, 
    issues: issue[]
  ): void {
    const responsesCodes = Object.keys(operationObj.responses || {});
    
    switch (operation) {
      case 'post':
        if (path.includes('/') && !path.match(/\/\{[^}]+\}$/) && !responsesCodes.includes('201')) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            'POST operation for resource creation should return 201 Created',
            'medium',
            'Add a 201 Created response for resource creation operations',
            this.CRITERION_NAME
          ));
        }
        break;
        
      case 'put':
      case 'patch':
        if (!responsesCodes.includes('200') && !responsesCodes.includes('204')) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            `${operation.toUpperCase()} operation should return 200 OK or 204 No Content`,
            'medium',
            'Add appropriate success response code (200 or 204) based on whether content is returned',
            this.CRITERION_NAME
          ));
        }
        break;
        
      case 'delete':
        if (!responsesCodes.includes('204')) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            'DELETE operation should typically return 204 No Content',
            'low',
            'Consider using 204 No Content for DELETE operations',
            this.CRITERION_NAME
          ));
        }
        break;
        
      case 'get':
        if (path.match(/\/\{[^}]+\}/) && !responsesCodes.includes('404')) {
          issues.push(this.createIssue(
            path,
            operation,
            'responses',
            'GET operation for a specific resource should handle 404 Not Found',
            'medium',
            'Add a 404 Not Found response for when the requested resource does not exist',
            this.CRITERION_NAME
          ));
        }
        break;
    }
  }
  
  private checkResponseConsistency(
    path: string, 
    operation: string, 
    responses: OpenAPIV3.ResponsesObject, 
    issues: issue[]
  ): void {
    const successResponses = Object.keys(responses || {}).filter(code => code.startsWith('2'));
    
    if (successResponses.length > 1) {
      const responseSchemas: Record<string, any> = {};
      
      for (const code of successResponses) {
        const response = responses[code];
        
        if ('$ref' in response) continue;
        
        const responseObj = response as OpenAPIV3.ResponseObject;
        
        if (responseObj.content) {
          for (const mediaType in responseObj.content) {
            if (responseObj.content[mediaType]?.schema) {
              responseSchemas[code] = responseObj.content[mediaType]?.schema;
            }
          }
        }
      }
      
      const schemaKeys = Object.keys(responseSchemas);
      for (let i = 0; i < schemaKeys.length; i++) {
        for (let j = i + 1; j < schemaKeys.length; j++) {
          const schema1 = responseSchemas[schemaKeys[i]];
          const schema2 = responseSchemas[schemaKeys[j]];
          
          if (schema1 && schema2) {
            const isRef1 = '$ref' in schema1;
            const isRef2 = '$ref' in schema2;
            
            if (isRef1 !== isRef2 || (isRef1 && isRef2 && schema1.$ref !== schema2.$ref)) {
              issues.push(this.createIssue(
                path,
                operation,
                `responses.${schemaKeys[i]} vs responses.${schemaKeys[j]}`,
                'Different success responses use inconsistent schema structures',
                'medium',
                'Use consistent schema structures across similar response codes',
                this.CRITERION_NAME
              ));
            }
          }
        }
      }
    }
  }
}