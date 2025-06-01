import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';
import { baseAnalyzer } from './baseAnalyzer';
import { scoringConfiguration } from '../scoring/scoringConfiguration';

export class schemaAndTypesAnalyzer extends baseAnalyzer {
  private readonly CRITERION_NAME = 'Schema & Types';

  analyze(document: OpenAPIV3.Document): criterionResult {
    const issues: issue[] = [];
    const criterion = scoringConfiguration.getCriterionByName(this.CRITERION_NAME)!;
    
    if (document.components?.schemas) {
      this.analyzeSchemas(document.components.schemas, issues);
    }
    
    if (document.paths) {
      this.analyzePathSchemas(document.paths, issues);
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
    let count = 0;
    
    if (document.components?.schemas) {
      count += Object.keys(document.components.schemas).length;
    }
    
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
            count += Object.keys(operationObj.responses).length;
          }
        }
      }
    }
    
    return count;
  }
  
  private getOperations(pathItem: OpenAPIV3.PathItemObject): string[] {
    return ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace']
      .filter(op => pathItem[op as keyof OpenAPIV3.PathItemObject]);
  }
  
  private analyzeSchemas(
    schemas: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>, 
    issues: issue[]
  ): void {
    for (const schemaName in schemas) {
      const schema = schemas[schemaName];
      
      if ('$ref' in schema) continue;
      
      const schemaObj = schema as OpenAPIV3.SchemaObject;
      
      if (!schemaObj.type && !schemaObj.allOf && !schemaObj.oneOf && !schemaObj.anyOf) {
        issues.push(this.createIssue(
          'components/schemas',
          undefined,
          schemaName,
          `Schema "${schemaName}" is missing a type definition`,
          'high',
          'Add a type property to the schema or use composition with $ref, allOf, oneOf, or anyOf',
          this.CRITERION_NAME
        ));
      }
      
      if (schemaObj.type === 'object' && !schemaObj.properties && !schemaObj.additionalProperties && 
          !schemaObj.allOf && !schemaObj.oneOf && !schemaObj.anyOf) {
        issues.push(this.createIssue(
          'components/schemas',
          undefined,
          schemaName,
          `Schema "${schemaName}" is an empty object with no properties defined`,
          'medium',
          'Define properties for the object or use composition patterns',
          this.CRITERION_NAME
        ));
      }
      
      if (schemaObj.type === 'array' && !schemaObj.items) {
        issues.push(this.createIssue(
          'components/schemas',
          undefined,
          schemaName,
          `Array schema "${schemaName}" does not define item type`,
          'high',
          'Add an items property to define the type of array elements',
          this.CRITERION_NAME
        ));
      }
      
      if (schemaObj.additionalProperties === true) {
        issues.push(this.createIssue(
          'components/schemas',
          undefined,
          schemaName,
          `Schema "${schemaName}" allows any additional properties without constraints`,
          'medium',
          'Consider defining a schema for additionalProperties or setting it to false',
          this.CRITERION_NAME
        ));
      }
      
      if (schemaObj.properties) {
        for (const propName in schemaObj.properties) {
          const property = schemaObj.properties[propName];
          
          if ('$ref' in property) continue;
          
          const propertyObj = property as OpenAPIV3.SchemaObject;
          
          if (!propertyObj.type && !propertyObj.allOf && !propertyObj.oneOf && !propertyObj.anyOf) {
            issues.push(this.createIssue(
              'components/schemas',
              undefined,
              `${schemaName}.properties.${propName}`,
              `Property "${propName}" in schema "${schemaName}" has no type definition`,
              'medium',
              'Add a type or schema reference to the property',
              this.CRITERION_NAME
            ));
          }
          
          if (propertyObj.type === 'array' && !propertyObj.items) {
            issues.push(this.createIssue(
              'components/schemas',
              undefined,
              `${schemaName}.properties.${propName}`,
              `Array property "${propName}" in schema "${schemaName}" does not define item type`,
              'medium',
              'Add an items property to define the type of array elements',
              this.CRITERION_NAME
            ));
          }
        }
      }
      
      if (schemaObj.properties) {
        this.analyzeNestedSchemas(schemaObj.properties, `components/schemas/${schemaName}`, issues);
      }
      
      
      if (schemaObj.type === 'array' && schemaObj.items && typeof schemaObj.items === 'object') {
  this.analyzeNestedSchema(schemaObj.items, `components/schemas/${schemaName}/items`, issues);
}
      
      if (schemaObj.required && schemaObj.properties) {
        const propNames = Object.keys(schemaObj.properties);
        for (const requiredProp of schemaObj.required) {
          if (!propNames.includes(requiredProp)) {
            issues.push(this.createIssue(
              'components/schemas',
              undefined,
              `${schemaName}.required`,
              `Schema "${schemaName}" requires property "${requiredProp}" that is not defined in properties`,
              'high',
              'Ensure all required properties are defined in the properties object',
              this.CRITERION_NAME
            ));
          }
        }
      }
    }
  }
  
  private analyzeNestedSchemas(
    properties: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>, 
    path: string, 
    issues: issue[]
  ): void {
    for (const propName in properties) {
      this.analyzeNestedSchema(properties[propName], `${path}/properties/${propName}`, issues);
    }
  }
  
  private analyzeNestedSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, 
    path: string, 
    issues: issue[]
  ): void {
    if ('$ref' in schema) return;
    
    const schemaObj = schema as OpenAPIV3.SchemaObject;
    
    if (!schemaObj.type && !schemaObj.allOf && !schemaObj.oneOf && !schemaObj.anyOf) {
      issues.push(this.createIssue(
        path,
        undefined,
        '',
        `Schema at "${path}" is missing a type definition`,
        'medium',
        'Add a type property or use schema composition',
        this.CRITERION_NAME
      ));
    }
    
    if (schemaObj.type === 'array' && !schemaObj.items) {
      issues.push(this.createIssue(
        path,
        undefined,
        '',
        `Array schema at "${path}" does not define item type`,
        'medium',
        'Add an items property to define the type of array elements',
        this.CRITERION_NAME
      ));
    }
    
    if (schemaObj.type === 'object' && !schemaObj.properties && !schemaObj.additionalProperties && 
        !schemaObj.allOf && !schemaObj.oneOf && !schemaObj.anyOf) {
      issues.push(this.createIssue(
        path,
        undefined,
        '',
        `Object schema at "${path}" has no properties defined`,
        'medium',
        'Define properties for the object schema',
        this.CRITERION_NAME
      ));
    }
    
    if (schemaObj.properties) {
      this.analyzeNestedSchemas(schemaObj.properties, path, issues);
    }
    
    if (schemaObj.type === 'array' && schemaObj.items && typeof schemaObj.items === 'object') {
      this.analyzeNestedSchema(schemaObj.items, `${path}/items`, issues);
    }
    
    ['allOf', 'oneOf', 'anyOf'].forEach(composition => {
      const compArray = schemaObj[composition as keyof OpenAPIV3.SchemaObject] as any[];
      if (compArray && Array.isArray(compArray)) {
        compArray.forEach((subSchema, index) => {
          this.analyzeNestedSchema(subSchema, `${path}/${composition}/${index}`, issues);
        });
      }
    });
  }
  
  private analyzePathSchemas(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    for (const path in paths) {
      const pathItem = paths[path] as OpenAPIV3.PathItemObject;
      const operations = this.getOperations(pathItem);
      
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        if (operationObj.requestBody) {
          this.checkRequestBodySchema(path, operation, operationObj.requestBody, issues);
        }
        
        if (operationObj.responses) {
          this.checkResponseSchemas(path, operation, operationObj.responses, issues);
        }
        
        if (operationObj.parameters) {
          this.checkParameterSchemas(path, operation, operationObj.parameters, issues);
        }
      }
    }
  }
  
  private checkRequestBodySchema(
    path: string, 
    operation: string, 
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject, 
    issues: issue[]
  ): void {
    if ('$ref' in requestBody) return;
    
    const requestBodyObj = requestBody as OpenAPIV3.RequestBodyObject;
    
    if (requestBodyObj.content) {
      for (const mediaType in requestBodyObj.content) {
        const content = requestBodyObj.content[mediaType];
        
        if (!content.schema) {
          issues.push(this.createIssue(
            path,
            operation,
            `requestBody.content.${mediaType}`,
            `Request body for ${operation.toUpperCase()} ${path} (${mediaType}) does not have a schema`,
            'high',
            'Define a schema for the request body content',
            this.CRITERION_NAME
          ));
        } else {
          this.analyzeContentSchema(
            content.schema,
            path,
            operation,
            `requestBody.content.${mediaType}.schema`,
            issues
          );
        }
      }
    }
  }
  
  private checkResponseSchemas(
    path: string, 
    operation: string, 
    responses: OpenAPIV3.ResponsesObject, 
    issues: issue[]
  ): void {
    for (const statusCode in responses) {
      const response = responses[statusCode];
      
      if ('$ref' in response) continue;
      
      const responseObj = response as OpenAPIV3.ResponseObject;
      
      if (responseObj.content) {
        for (const mediaType in responseObj.content) {
          const content = responseObj.content[mediaType];
          
          if (!content.schema) {
            issues.push(this.createIssue(
              path,
              operation,
              `responses.${statusCode}.content.${mediaType}`,
              `Response for ${operation.toUpperCase()} ${path} (${statusCode}, ${mediaType}) does not have a schema`,
              'high',
              'Define a schema for the response content',
              this.CRITERION_NAME
            ));
          } else {
            this.analyzeContentSchema(
              content.schema,
              path,
              operation,
              `responses.${statusCode}.content.${mediaType}.schema`,
              issues
            );
          }
        }
      }
    }
  }
  
  private checkParameterSchemas(
    path: string,
    operation: string,
    parameters: Array<OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject>,
    issues: issue[]
  ): void {
    parameters.forEach((param, index) => {
      if ('$ref' in param) return;
      
      const paramObj = param as OpenAPIV3.ParameterObject;
      
      if (!paramObj.schema && !paramObj.content) {
        issues.push(this.createIssue(
          path,
          operation,
          `parameters[${index}]`,
          `Parameter "${paramObj.name}" has neither schema nor content defined`,
          'high',
          'Define either a schema or content for the parameter',
          this.CRITERION_NAME
        ));
      }
      
      if (paramObj.schema) {
        this.analyzeContentSchema(
          paramObj.schema,
          path,
          operation,
          `parameters[${index}].schema`,
          issues
        );
      }
      
      if (paramObj.content) {
        for (const mediaType in paramObj.content) {
          const content = paramObj.content[mediaType];
          
          if (!content.schema) {
            issues.push(this.createIssue(
              path,
              operation,
              `parameters[${index}].content.${mediaType}`,
              `Parameter "${paramObj.name}" content (${mediaType}) does not have a schema`,
              'high',
              'Define a schema for the parameter content',
              this.CRITERION_NAME
            ));
          } else {
            this.analyzeContentSchema(
              content.schema,
              path,
              operation,
              `parameters[${index}].content.${mediaType}.schema`,
              issues
            );
          }
        }
      }
    });
  }
  
  private analyzeContentSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    path: string,
    operation: string,
    location: string,
    issues: issue[]
  ): void {
    if ('$ref' in schema) return;
    
    const schemaObj = schema as OpenAPIV3.SchemaObject;
    
    if (!schemaObj.type && !schemaObj.allOf && !schemaObj.oneOf && !schemaObj.anyOf) {
      issues.push(this.createIssue(
        path,
        operation,
        location,
        `Schema for ${location} is missing a type definition`,
        'medium',
        'Add a type property to the schema or use composition',
        this.CRITERION_NAME
      ));
    }
    
    if (schemaObj.type === 'array' && !schemaObj.items) {
      issues.push(this.createIssue(
        path,
        operation,
        location,
        `Array schema for ${location} does not define item type`,
        'medium',
        'Add an items property to define the type of array elements',
        this.CRITERION_NAME
      ));
    }
    
    if (schemaObj.type === 'object' && !schemaObj.properties && !schemaObj.additionalProperties && 
        !schemaObj.allOf && !schemaObj.oneOf && !schemaObj.anyOf) {
      issues.push(this.createIssue(
        path,
        operation,
        location,
        `Object schema for ${location} has no properties defined`,
        'medium',
        'Define properties for the object schema',
        this.CRITERION_NAME
      ));
    }
    
    if (schemaObj.properties) {
      for (const propName in schemaObj.properties) {
        const prop = schemaObj.properties[propName];
        
        if ('$ref' in prop) continue;
        
        const propObj = prop as OpenAPIV3.SchemaObject;
        
        if (!propObj.type && !propObj.allOf && !propObj.oneOf && !propObj.anyOf) {
          issues.push(this.createIssue(
            path,
            operation,
            `${location}.properties.${propName}`,
            `Property "${propName}" has no type definition`,
            'medium',
            'Add a type or schema reference to the property',
            this.CRITERION_NAME
          ));
        }
        
        if (propObj.type === 'array' && !propObj.items) {
          issues.push(this.createIssue(
            path,
            operation,
            `${location}.properties.${propName}`,
            `Array property "${propName}" does not define item type`,
            'medium',
            'Add an items property to define the type of array elements',
            this.CRITERION_NAME
          ));
        }
      }
    }
  }
}