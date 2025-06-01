import { OpenAPIV3 } from 'openapi-types';
import { criterionResult, issue } from '../scoring/types';
import { baseAnalyzer } from './baseAnalyzer';
import { scoringConfiguration } from '../scoring/scoringConfiguration';

export class securityAnalyzer extends baseAnalyzer {
  private readonly CRITERION_NAME = 'Security';

  analyze(document: OpenAPIV3.Document): criterionResult {
    const issues: issue[] = [];
    const criterion = scoringConfiguration.getCriterionByName(this.CRITERION_NAME)!;
    
    this.checkGlobalSecurity(document, issues);
    
    if (document.components?.securitySchemes) {
      this.checkSecuritySchemes(document.components.securitySchemes, issues);
    }
    
    if (document.paths) {
      this.checkOperationSecurity(document.paths, document.security, issues);
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
    let count = 1; // Global security
    
    if (document.components?.securitySchemes) {
      count += Object.keys(document.components.securitySchemes).length;
    }
    
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
  
  private checkGlobalSecurity(document: OpenAPIV3.Document, issues: issue[]): void {
    if (!document.security || document.security.length === 0) {
      issues.push(this.createIssue(
        'root',
        undefined,
        'security',
        'No global security requirements defined',
        'medium',
        'Define global security requirements to ensure all endpoints are secured by default',
        this.CRITERION_NAME
      ));
    }
  }
  
  private checkSecuritySchemes(
    securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject | OpenAPIV3.ReferenceObject>, 
    issues: issue[]
  ): void {
    for (const schemeName in securitySchemes) {
      const scheme = securitySchemes[schemeName];
      
      if ('$ref' in scheme) continue;
      
      const schemeObj = scheme as OpenAPIV3.SecuritySchemeObject;
      
      if (!schemeObj.type) {
        issues.push(this.createIssue(
          'components/securitySchemes',
          undefined,
          schemeName,
          'Security scheme is missing a type',
          'high',
          'Define a valid security scheme type (apiKey, http, oauth2, openIdConnect)',
          this.CRITERION_NAME
        ));
        continue;
      }
      
      switch (schemeObj.type) {
        case 'apiKey':
          if (!schemeObj.name) {
            issues.push(this.createIssue(
              'components/securitySchemes',
              undefined,
              schemeName,
              'API key security scheme is missing the "name" property',
              'high',
              'Add the name property to specify the key name',
              this.CRITERION_NAME
            ));
          }
          
          if (!schemeObj.in) {
            issues.push(this.createIssue(
              'components/securitySchemes',
              undefined,
              schemeName,
              'API key security scheme is missing the "in" property',
              'high',
              'Add the in property to specify where the key is located (header, query, cookie)',
              this.CRITERION_NAME
            ));
          }
          break;
          
        case 'http':
          if (!schemeObj.scheme) {
            issues.push(this.createIssue(
              'components/securitySchemes',
              undefined,
              schemeName,
              'HTTP security scheme is missing the "scheme" property',
              'high',
              'Add the scheme property (e.g., basic, bearer, digest)',
              this.CRITERION_NAME
            ));
          }
          break;
          
        case 'oauth2':
          if (!schemeObj.flows || Object.keys(schemeObj.flows).length === 0) {
            issues.push(this.createIssue(
              'components/securitySchemes',
              undefined,
              schemeName,
              'OAuth2 security scheme is missing flow definitions',
              'high',
              'Define at least one OAuth2 flow (implicit, password, clientCredentials, authorizationCode)',
              this.CRITERION_NAME
            ));
          } else {
            this.checkOAuth2Flows(schemeName, schemeObj.flows, issues);
          }
          break;
          
        case 'openIdConnect':
          if (!schemeObj.openIdConnectUrl) {
            issues.push(this.createIssue(
              'components/securitySchemes',
              undefined,
              schemeName,
              'OpenID Connect security scheme is missing the "openIdConnectUrl" property',
              'high',
              'Add the openIdConnectUrl property pointing to the OpenID Connect configuration',
              this.CRITERION_NAME
            ));
          }
          break;
          
      default:
  issues.push(this.createIssue(
    'components/securitySchemes',
    undefined,
    schemeName,
    `Invalid security scheme type: "${(schemeObj as any).type}"`,
    'high',
    'Use a valid security scheme type (apiKey, http, oauth2, openIdConnect)',
    this.CRITERION_NAME
  ));
}
    }}
  
  private checkOAuth2Flows(
    schemeName: string, 
    flows: any, 
    issues: issue[]
  ): void {
    if (flows.implicit) {
      this.checkOAuth2Flow(schemeName, 'implicit', flows.implicit, true, false, issues);
    }
    
    if (flows.password) {
      this.checkOAuth2Flow(schemeName, 'password', flows.password, false, true, issues);
    }
    
    if (flows.clientCredentials) {
      this.checkOAuth2Flow(schemeName, 'clientCredentials', flows.clientCredentials, false, true, issues);
    }
    
    if (flows.authorizationCode) {
      this.checkOAuth2Flow(schemeName, 'authorizationCode', flows.authorizationCode, true, true, issues);
    }
  }
  
  private checkOAuth2Flow(
    schemeName: string,
    flowType: string,
    flow: any, 
    requiresAuthUrl: boolean,
    requiresTokenUrl: boolean,
    issues: issue[]
  ): void {
    if (!flow.scopes || Object.keys(flow.scopes).length === 0) {
      issues.push(this.createIssue(
        'components/securitySchemes',
        undefined,
        `${schemeName}.flows.${flowType}`,
        `OAuth2 flow "${flowType}" is missing scopes`,
        'high',
        'Define at least one scope for the OAuth2 flow',
        this.CRITERION_NAME
      ));
    }
    
    if (requiresAuthUrl && !flow.authorizationUrl) {
      issues.push(this.createIssue(
        'components/securitySchemes',
        undefined,
        `${schemeName}.flows.${flowType}`,
        `OAuth2 ${flowType} flow is missing authorizationUrl`,
        'high',
        'Add the authorizationUrl property',
        this.CRITERION_NAME
      ));
    }
    
    if (requiresTokenUrl && !flow.tokenUrl) {
      issues.push(this.createIssue(
        'components/securitySchemes',
        undefined,
        `${schemeName}.flows.${flowType}`,
        `OAuth2 ${flowType} flow is missing tokenUrl`,
        'high',
        'Add the tokenUrl property',
        this.CRITERION_NAME
      ));
    }
  }
  
  private checkOperationSecurity(
    paths: OpenAPIV3.PathsObject,
    globalSecurity: OpenAPIV3.SecurityRequirementObject[] | undefined,
    issues: issue[]
  ): void {
    const writeOperations = ['post', 'put', 'patch', 'delete'];
    
    for (const path in paths) {
      const pathItem = paths[path] as OpenAPIV3.PathItemObject;
      const operations = this.getOperations(pathItem);
      
      for (const operation of operations) {
        const operationObj = pathItem[operation as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject;
        
        const hasSecurity = operationObj.security !== undefined;
        const hasEmptySecurity = operationObj.security !== undefined && operationObj.security.length === 0;
        const hasGlobalSecurity = globalSecurity !== undefined && globalSecurity.length > 0;
        
        if (hasEmptySecurity) {
          const severity = writeOperations.includes(operation) ? 'high' : 'medium';
          
          issues.push(this.createIssue(
            path,
            operation,
            'security',
            `${operation.toUpperCase()} operation explicitly disables security`,
            severity,
            writeOperations.includes(operation)
              ? 'Consider adding security requirements for write operations'
              : 'Consider if this operation really should be publicly accessible',
            this.CRITERION_NAME
          ));
        } else if (!hasSecurity && !hasGlobalSecurity) {
          const severity = writeOperations.includes(operation) ? 'high' : 'medium';
          
          issues.push(this.createIssue(
            path,
            operation,
            'security',
            `${operation.toUpperCase()} operation has no security requirements`,
            severity,
            writeOperations.includes(operation)
              ? 'Add security requirements for write operations'
              : 'Consider adding security requirements',
            this.CRITERION_NAME
          ));
        }
      }
    }
  }
}