import { baseParserError } from './baseParserError';

export class resolverParserError extends baseParserError {
  constructor(source: string, input: string, message: string) {
    super(`Reference Resolution Error in ${source} "${input}":\n${message}`);
  }
}
