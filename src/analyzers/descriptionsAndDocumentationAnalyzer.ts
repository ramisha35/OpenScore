import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';
import { baseAnalyzer } from './baseAnalyzer';
import { scoringConfiguration } from '../scoring/scoringConfiguration';

export class descriptionsAndDocumentationAnalyzer extends baseAnalyzer {
  private readonly CRITERION_NAME = 'Descriptions & Documentation';

  analyze(document: OpenAPIV3.Document): criterionResult {
    const issues: issue[] = [];
    const criterion = scoringConfiguration.getCriterionByName(this.CRITERION_NAME)!;

    this.checkApiInfo(document, issues);
    
    if (document.paths) {
      this.checkPaths(document.paths, issues);
    }
    
    if (document.components) {
      this.checkComponents(document.components, issues);
    }
    
    const score = this.calculateScore(issues, this.countCheckableItems(document), criterion.maxScore);
    
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
    let count = 1;
    
    if (document.paths) {
      for (const path in document.paths) {
        count++; 
        
        const pathItem = document.paths[path] as OpenAPIV3.PathItemObject;
        const operations = this.getOperations(pathItem);
        
        for (const operation of operations) {
          const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
          count++; 
          
          if (operationObj.parameters) {
            count += operationObj.parameters.length;
          }
          
          if (operationObj.requestBody) {
            count++;
          }
          
          if (operationObj.responses) {
            count += Object.keys(operationObj.responses).length;
          }
        }
      }
    }
    
    if (document.components) {
      if (document.components.schemas) {
        count += Object.keys(document.components.schemas).length;
      }
      
      if (document.components.parameters) {
        count += Object.keys(document.components.parameters).length;
      }
      
      if (document.components.requestBodies) {
        count += Object.keys(document.components.requestBodies).length;
      }
      
      if (document.components.responses) {
        count += Object.keys(document.components.responses).length;
      }
    }
    
    return count;
  }
  
  private getOperations(pathItem: OpenAPIV3.PathItemObject): string[] {
    return ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace']
      .filter(op => pathItem[op as keyof OpenAPIV3.PathItemObject]);
  }
  
  private checkApiInfo(document: OpenAPIV3.Document, issues: issue[]): void {
    if (!document.info.description || document.info.description.trim().length < 20) {
      issues.push(this.createIssue(
        'info',
        undefined,
        'description',
        'API description is missing or too short',
        'high',
        'Add a detailed description (at least 20 characters) explaining the purpose of the API',
        this.CRITERION_NAME
      ));
    }
    
    if (!document.info.contact) {
      issues.push(this.createIssue(
        'info',
        undefined,
        'contact',
        'API contact information is missing',
        'medium',
        'Add contact information to help API consumers reach out for support',
        this.CRITERION_NAME
      ));
    }
  }
  
  private checkPaths(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    for (const path in paths) {
      const pathItem = paths[path] as OpenAPIV3.PathItemObject;
      
      if (pathItem.summary && (!pathItem.description || pathItem.description.trim().length < 10)) {
        issues.push(this.createIssue(
          path,
          undefined,
          'description',
          'Path has a summary but missing or short description',
          'low',
          'Add a more detailed description for the path',
          this.CRITERION_NAME
        ));
      }
      
      const operations = this.getOperations(pathItem);
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        this.checkOperation(path, operation, operationObj, issues);
      }
    }
  }
  
  private checkOperation(
    path: string, 
    operation: string, 
    operationObj: OpenAPIV3.OperationObject, 
    issues: issue[]
  ): void {
    if (!operationObj.description || operationObj.description.trim().length < 15) {
      const severity = operationObj.summary ? 'medium' : 'high';
      issues.push(this.createIssue(
        path,
        operation,
        'description',
        `Operation ${operation.toUpperCase()} ${path} has ${
          operationObj.description ? 'a short' : 'no'
        } description`,
        severity,
        'Add a detailed description explaining what the operation does, expected behavior, and side effects',
        this.CRITERION_NAME
      ));
    }
    
    if (operationObj.parameters) {
      this.checkParameters(path, operation, operationObj.parameters, issues);
    }
    
    if (operationObj.requestBody) {
      this.checkRequestBody(path, operation, operationObj.requestBody, issues);
    }
    
    if (operationObj.responses) {
      this.checkResponses(path, operation, operationObj.responses, issues);
    }
  }
  
  private checkParameters(
    path: string, 
    operation: string, 
    parameters: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>, 
    issues: issue[]
  ): void {
    parameters.forEach((param, index) => {
      if ('$ref' in param) return; // Skip reference objects, they should be checked in components
      
      const parameter = param as OpenAPIV3.ParameterObject;
      
      if (!parameter.description || parameter.description.trim().length < 5) {
        issues.push(this.createIssue(
          path,
          operation,
          `parameters[${index}] (${parameter.name} in ${parameter.in})`,
          `Parameter "${parameter.name}" has ${parameter.description ? 'a short' : 'no'} description`,
          'medium',
          'Add a clear description explaining the parameter purpose, constraints, and format',
          this.CRITERION_NAME
        ));
      }
    });
  }
  
  private checkRequestBody(
    path: string, 
    operation: string, 
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject, 
    issues: issue[]
  ): void {
    if ('$ref' in requestBody) return; // Skip reference objects
    
    const reqBody = requestBody as OpenAPIV3.RequestBodyObject;
    
    if (!reqBody.description || reqBody.description.trim().length < 10) {
      issues.push(this.createIssue(
        path,
        operation,
        'requestBody',
        `Request body has ${reqBody.description ? 'a short' : 'no'} description`,
        'medium',
        'Add a detailed description explaining the expected payload',
        this.CRITERION_NAME
      ));
    }
  }
  
  private checkResponses(
    path: string, 
    operation: string, 
    responses: OpenAPIV3.ResponsesObject, 
    issues: issue[]
  ): void {
    for (const statusCode in responses) {
      const response = responses[statusCode];
      
      if ('$ref' in response) continue; 
      
      const responseObj = response as OpenAPIV3.ResponseObject;
      
      if (!responseObj.description || responseObj.description.trim().length < 5) {
        issues.push(this.createIssue(
          path,
          operation,
          `responses.${statusCode}`,
          `Response for status code ${statusCode} has ${
            responseObj.description ? 'a short' : 'no'
          } description`,
          statusCode.startsWith('2') ? 'high' : 'medium', 
          'Add a clear description explaining the meaning of this status code in context',
          this.CRITERION_NAME
        ));
      }
    }
  }
  
  private checkComponents(components: OpenAPIV3.ComponentsObject, issues: issue[]): void {
    if (components.schemas) {
      for (const schemaName in components.schemas) {
        const schema = components.schemas[schemaName];
        
        if ('$ref' in schema) continue;
        
        const schemaObj = schema as OpenAPIV3.SchemaObject;
        
        if (!schemaObj.description || schemaObj.description.trim().length < 10) {
          issues.push(this.createIssue(
            'components/schemas',
            undefined,
            schemaName,
            `Schema "${schemaName}" has ${schemaObj.description ? 'a short' : 'no'} description`,
            'medium',
            'Add a detailed description explaining what this schema represents',
            this.CRITERION_NAME
          ));
        }
        
        if (schemaObj.properties) {
          for (const propName in schemaObj.properties) {
            const property = schemaObj.properties[propName];
            
            if ('$ref' in property) continue;
            
            const propertyObj = property as OpenAPIV3.SchemaObject;
            
            if (!propertyObj.description || propertyObj.description.trim().length < 5) {
              issues.push(this.createIssue(
                'components/schemas',
                undefined,
                `${schemaName}.properties.${propName}`,
                `Property "${propName}" in schema "${schemaName}" has ${
                  propertyObj.description ? 'a short' : 'no'
                } description`,
                'low',
                'Add a description explaining what this property represents',
                this.CRITERION_NAME
              ));
            }
          }
        }
      }
    }
    
    if (components.parameters) {
      for (const paramName in components.parameters) {
        const param = components.parameters[paramName];
        
        if ('$ref' in param) continue; 
        
        const paramObj = param as OpenAPIV3.ParameterObject;
        
        if (!paramObj.description || paramObj.description.trim().length < 5) {
          issues.push(this.createIssue(
            'components/parameters',
            undefined,
            paramName,
            `Parameter "${paramName}" has ${paramObj.description ? 'a short' : 'no'} description`,
            'medium',
            'Add a clear description explaining the parameter purpose',
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
        
        if (!requestBodyObj.description || requestBodyObj.description.trim().length < 10) {
          issues.push(this.createIssue(
            'components/requestBodies',
            undefined,
            requestBodyName,
            `Request body "${requestBodyName}" has ${
              requestBodyObj.description ? 'a short' : 'no'
            } description`,
            'medium',
            'Add a detailed description explaining the expected payload',
            this.CRITERION_NAME
          ));
        }
      }
    }
    
    if (components.responses) {
      for (const responseName in components.responses) {
        const response = components.responses[responseName];
        
        if ('$ref' in response) continue; 
        
        const responseObj = response as OpenAPIV3.ResponseObject;
        
        if (!responseObj.description || responseObj.description.trim().length < 10) {
          issues.push(this.createIssue(
            'components/responses',
            undefined,
            responseName,
            `Response "${responseName}" has ${
              responseObj.description ? 'a short' : 'no'
            } description`,
            'medium',
            'Add a clear description explaining this response',
            this.CRITERION_NAME
          ));
        }
      }
    }
  }
}