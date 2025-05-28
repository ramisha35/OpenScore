import { baseParserError } from './baseParserError';

export class connectionError extends baseParserError {
  constructor(source: string, input: string, message: string) {
    super(`${message} "${input}"`);
  }
}
