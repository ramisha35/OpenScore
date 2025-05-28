import {
    syntaxParserError,
    validationParserError,
    resolverParserError,
    connectionError,
    baseParserError
  } from './errors';
  
  export class errorFormatter {
    static getSource(input: string): string {
      const lower = input.toLowerCase();
      return lower.startsWith('http://') || lower.startsWith('https://') ? 'URL' : 'file';
    }
  
    static format(error: any, input: string): Error {
      const source = this.getSource(input);
  
      switch (error.name) {
        case 'SyntaxError':
          return new syntaxParserError(source, input, error.message);
        case 'ValidatorError':
          return new validationParserError(source, input, error.message);
        case 'ResolverError':
          return new resolverParserError(source, input, error.message);
        case 'ParserError':
          return new syntaxParserError(source, input, error.message);
      }
  
      switch (error.code) {
        case 'ENOENT':
          return new connectionError(source, input, 'File not found:');
        case 'ENOTFOUND':
          return new connectionError(source, input, 'URL not found:');
        case 'ECONNREFUSED':
          return new connectionError(source, input, 'Connection refused to:');
      }
  
      return new baseParserError(`Failed to load OpenAPI spec from ${source} "${input}":\n${error.message}`);
    }
  }
  