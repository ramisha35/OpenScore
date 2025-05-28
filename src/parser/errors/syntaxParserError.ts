import { baseParserError } from './baseParserError';

export class syntaxParserError extends baseParserError {
  constructor(source: string, input: string, message: string) {
    super(`Syntax Error in ${source} "${input}":\n${message}`);
  }
}
