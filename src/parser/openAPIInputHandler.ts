import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import { errorFormatter } from './errorFormater';

export class OpenAPIInputHandler {
  async handleInput(input: string): Promise<OpenAPIV3.Document> {
    if (!input || input.trim().length === 0) {
      throw new Error('Input cannot be empty');
    }

    try {
      console.log(`Loading OpenAPI spec from: ${input}`);
      const api = await SwaggerParser.validate(input);

      console.log(`Successfully validated OpenAPI spec`);
      console.log(`Title: ${api.info.title}`);
      console.log(`Version: ${api.info.version}`);
      console.log(`Endpoints: ${Object.keys(api.paths || {}).length}`);

      return api as OpenAPIV3.Document;
    } catch (error: any) {
      throw errorFormatter.format(error, input);
    }
  }
}
