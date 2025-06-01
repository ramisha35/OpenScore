import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';
import { baseAnalyzer } from './baseAnalyzer';
import { scoringConfiguration } from '../scoring/scoringConfiguration';

export class pathsAndOperationsAnalyzer extends baseAnalyzer {
  private readonly CRITERION_NAME = 'Paths & Operations';

  analyze(document: OpenAPIV3.Document): criterionResult {
    const issues: issue[] = [];
    const criterion = scoringConfiguration.getCriterionByName(this.CRITERION_NAME)!;
    
    if (document.paths) {
      this.checkPathNaming(document.paths, issues);
      this.checkPathParameterConsistency(document.paths, issues);
      this.checkCrudConsistency(document.paths, issues);
      this.checkRedundantPaths(document.paths, issues);
      this.checkOperationIds(document.paths, issues);
    }
    
    const score = this.calculateScore(
      issues, 
      Object.keys(document.paths || {}).length * 2, 
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
  
  private checkPathNaming(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    const pathSegments: Record<string, string[]> = {};
    
    for (const path in paths) {
      if (path !== '/' && path.endsWith('/')) {
        issues.push(this.createIssue(
          path,
          undefined,
          '',
          'Path has a trailing slash',
          'low',
          'Remove trailing slash for consistency',
          this.CRITERION_NAME
        ));
      }
      
      const segments = path.split('/').filter(s => s);
      
      for (const segment of segments) {
        if (segment.startsWith('{') && segment.endsWith('}')) {
          const paramName = segment.slice(1, -1);
          
          if (!/^[a-z][a-zA-Z0-9]*$/.test(paramName)) {
            issues.push(this.createIssue(
              path,
              undefined,
              segment,
              `Path parameter "${paramName}" does not follow camelCase naming convention`,
              'low',
              'Use camelCase for path parameters',
              this.CRITERION_NAME
            ));
          }
          
          continue;
        }
        
        if (!/^[a-z][a-z0-9-]*$/.test(segment)) {
          issues.push(this.createIssue(
            path,
            undefined,
            segment,
            `Path segment "${segment}" does not follow kebab-case naming convention`,
            'low',
            'Use kebab-case (lowercase with hyphens) for path segments',
            this.CRITERION_NAME
          ));
        }
        
        if (!pathSegments[segment.toLowerCase()]) {
          pathSegments[segment.toLowerCase()] = [];
        }
        pathSegments[segment.toLowerCase()].push(segment);
      }
    }
    
    for (const lowercaseSegment in pathSegments) {
      const segments = pathSegments[lowercaseSegment];
      const uniqueSegments = [...new Set(segments)];
      
      if (uniqueSegments.length > 1) {
        issues.push(this.createIssue(
          'paths',
          undefined,
          lowercaseSegment,
          `Inconsistent casing for path segment "${lowercaseSegment}" (found: ${uniqueSegments.join(', ')})`,
          'medium',
          'Use consistent casing for the same path segments across all endpoints',
          this.CRITERION_NAME
        ));
      }
    }
  }
  
  private checkPathParameterConsistency(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    const parametersByPath: Record<string, Set<string>> = {};
    
    for (const path in paths) {
      const params = path.match(/\{([^}]+)\}/g) || [];
      parametersByPath[path] = new Set(params.map(p => p.slice(1, -1)));
    }
    
    for (const path1 in parametersByPath) {
      for (const path2 in parametersByPath) {
        if (path1 === path2) continue;
        
        const pathPattern1 = path1.replace(/\{[^}]+\}/g, '{param}');
        const pathPattern2 = path2.replace(/\{[^}]+\}/g, '{param}');
        
        if (pathPattern1 === pathPattern2) {
          const params1 = [...parametersByPath[path1]];
          const params2 = [...parametersByPath[path2]];
          
          if (params1.length !== params2.length) {
            issues.push(this.createIssue(
              'paths',
              undefined,
              `${path1} vs ${path2}`,
              'Similar paths use different number of parameters',
              'medium',
              'Use consistent parameter naming across similar paths',
              this.CRITERION_NAME
            ));
          } else {
            for (let i = 0; i < params1.length; i++) {
              if (params1[i] !== params2[i]) {
                issues.push(this.createIssue(
                  'paths',
                  undefined,
                  `${path1} vs ${path2}`,
                  `Similar paths use different parameter names (${params1[i]} vs ${params2[i]})`,
                  'medium',
                  'Use consistent parameter naming across similar paths',
                  this.CRITERION_NAME
                ));
              }
            }
          }
        }
      }
    }
  }
  
  private checkCrudConsistency(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    const resourcePaths: Record<string, Set<string>> = {};
    
    for (const path in paths) {
      if (path.match(/\/\{[^}]+\}$/)) continue;
      
      const segments = path.split('/').filter(s => s);
      if (segments.length === 0) continue;
      
      const lastSegment = segments[segments.length - 1];
      if (lastSegment.startsWith('{') && lastSegment.endsWith('}')) continue;
      
      const resource = lastSegment.toLowerCase();
      
      if (!resourcePaths[resource]) {
        resourcePaths[resource] = new Set();
      }
      resourcePaths[resource].add(path);
    }
    
    for (const resource in resourcePaths) {
      const resourcePathList = [...resourcePaths[resource]];
      
      for (const path of resourcePathList) {
        const pathItem = paths[path] as OpenAPIV3.PathItemObject;
        const operations = this.getOperations(pathItem);
        
        if (!path.match(/\/\{[^}]+\}$/)) {
          if (operations.includes('put') || operations.includes('patch')) {
            issues.push(this.createIssue(
              path,
              operations.includes('put') ? 'put' : 'patch',
              '',
              `Using ${operations.includes('put') ? 'PUT' : 'PATCH'} on a collection resource`,
              'medium',
              'PUT/PATCH should typically be used on individual resources, not collections',
              this.CRITERION_NAME
            ));
          }
          
          if (operations.includes('delete')) {
            const deleteOperation = pathItem.delete as OpenAPIV3.OperationObject;
            const hasFilterParam = deleteOperation.parameters?.some(
              p => ('name' in p && ['filter', 'ids', 'query'].includes(p.name))
            );
            
            if (!hasFilterParam) {
              issues.push(this.createIssue(
                path,
                'delete',
                '',
                'DELETE operation on a collection resource without filtering parameters',
                'medium',
                'Add filter parameters or use DELETE only on individual resources',
                this.CRITERION_NAME
              ));
            }
          }
        }
        
        if (path.match(/\/\{[^}]+\}$/)) {
          if (operations.includes('post')) {
            issues.push(this.createIssue(
              path,
              'post',
              '',
              'Using POST on an individual resource path',
              'medium',
              'POST is typically used for collection resources, not individual items',
              this.CRITERION_NAME
            ));
          }
        }
      }
    }
  }
  
  private checkRedundantPaths(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    const normalizedPaths: Record<string, string[]> = {};
    
    for (const path in paths) {
      const normalized = path.replace(/\{[^}]+\}/g, '{param}');
      
      if (!normalizedPaths[normalized]) {
        normalizedPaths[normalized] = [];
      }
      normalizedPaths[normalized].push(path);
    }
    
    for (const normalized in normalizedPaths) {
      const duplicates = normalizedPaths[normalized];
      
      if (duplicates.length > 1) {
        const operationsByPath: Record<string, string[]> = {};
        
        for (const path of duplicates) {
          const pathItem = paths[path] as OpenAPIV3.PathItemObject;
          operationsByPath[path] = this.getOperations(pathItem);
        }
        
        for (let i = 0; i < duplicates.length; i++) {
          for (let j = i + 1; j < duplicates.length; j++) {
            const path1 = duplicates[i];
            const path2 = duplicates[j];
            
            const ops1 = operationsByPath[path1];
            const ops2 = operationsByPath[path2];
            
            const overlapping = ops1.filter(op => ops2.includes(op));
            
            if (overlapping.length > 0) {
              issues.push(this.createIssue(
                'paths',
                undefined,
                `${path1} vs ${path2}`,
                `Potentially redundant paths with overlapping operations (${overlapping.join(', ')})`,
                'high',
                'Consider consolidating these paths or ensuring they serve different purposes',
                this.CRITERION_NAME
              ));
            }
          }
        }
      }
    }
  }
  
  private checkOperationIds(paths: OpenAPIV3.PathsObject, issues: issue[]): void {
    const operationIds = new Set<string>();
    const operationIdsLowercase = new Set<string>();
    
    for (const path in paths) {
      const pathItem = paths[path] as OpenAPIV3.PathItemObject;
      const operations = this.getOperations(pathItem);
      
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        if (!operationObj.operationId) {
          issues.push(this.createIssue(
            path,
            operation,
            'operationId',
            'Operation is missing an operationId',
            'medium',
            'Add a unique operationId to help with SDK generation and client usage',
            this.CRITERION_NAME
          ));
          continue;
        }
        
        if (operationIds.has(operationObj.operationId)) {
          issues.push(this.createIssue(
            path,
            operation,
            'operationId',
            `Duplicate operationId: "${operationObj.operationId}"`,
            'high',
            'Use unique operationIds across all operations',
            this.CRITERION_NAME
          ));
        }
        
        const lowerCaseId = operationObj.operationId.toLowerCase();
        if (operationIdsLowercase.has(lowerCaseId) && 
            !operationIds.has(operationObj.operationId)) {
          issues.push(this.createIssue(
            path,
            operation,
            'operationId',
            `Case-insensitive duplicate operationId: "${operationObj.operationId}"`,
            'medium',
            'Use operationIds that are unique even when case is ignored',
            this.CRITERION_NAME
          ));
        }
        
        if (!/^[a-z][a-zA-Z0-9]*$/.test(operationObj.operationId)) {
          issues.push(this.createIssue(
            path,
            operation,
            'operationId',
            `OperationId "${operationObj.operationId}" does not follow camelCase naming convention`,
            'low',
            'Use camelCase for operationIds',
            this.CRITERION_NAME
          ));
        }
        
        operationIds.add(operationObj.operationId);
        operationIdsLowercase.add(lowerCaseId);
      }
    }
    
    const methodPrefixes = {
      get: ['get', 'read', 'fetch', 'list', 'retrieve'],
      post: ['create', 'add', 'post', 'insert'],
      put: ['update', 'put', 'replace'],
      patch: ['patch', 'modify', 'partial'],
      delete: ['delete', 'remove']
    };
    
    for (const path in paths) {
      const pathItem = paths[path] as OpenAPIV3.PathItemObject;
      const operations = this.getOperations(pathItem);
      
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        if (!operationObj.operationId) continue;
        
        const prefixes = methodPrefixes[operation as keyof typeof methodPrefixes];
        
        if (prefixes) {
          const hasMethodPrefix = prefixes.some(prefix => 
            operationObj.operationId!.toLowerCase().startsWith(prefix.toLowerCase())
          );
          
          if (!hasMethodPrefix) {
            issues.push(this.createIssue(
              path,
              operation,
              'operationId',
              `OperationId "${operationObj.operationId}" does not indicate the HTTP method (${operation.toUpperCase()})`,
              'low',
              `Consider prefixing operationId with ${prefixes.join('/, /')} to indicate the operation type`,
              this.CRITERION_NAME
            ));
          }
        }
      }
    }
  }
}