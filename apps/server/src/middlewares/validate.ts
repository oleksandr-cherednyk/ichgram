import { type NextFunction, type Request, type Response } from 'express';
import { type ZodSchema } from 'zod';

type ValidationSchemas = {
  body?: ZodSchema<unknown>;
  query?: ZodSchema<unknown>;
  params?: ZodSchema<unknown>;
};

export const validate =
  (schemas: ValidationSchemas) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (schemas.body) {
      request.body = schemas.body.parse(request.body);
    }

    if (schemas.query) {
      // Validate only - query is read-only in newer express versions
      schemas.query.parse(request.query);
    }

    if (schemas.params) {
      // Validate only - params is read-only in newer express versions
      schemas.params.parse(request.params);
    }

    next();
  };
