import { OpenAPIInputHandler } from './parser/openAPIInputHandler';

async function validateSpec(input: string) {
  const handler = new OpenAPIInputHandler();
  try {
    const api = await handler.handleInput(input);
    console.log("Validation successful!");
    return api;
  } catch (err) {
    console.error("Validation failed:", err);
  }
}

// Example with a public OpenAPI spec URL
validateSpec('https://petstore3.swagger.io/api/v3/openapi.json');

// You can try other public exam