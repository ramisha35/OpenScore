import { baseParserError } from './baseParserError';

export class validationParserError extends baseParserError {
  constructor(source: string, input: string, message: string) {
    super(`OpenAPI Validation Error in ${source} "${input}":\n${message}`);
  }
}
