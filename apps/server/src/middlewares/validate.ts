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
      request.query = schemas.query.parse(request.query) as Request['query'];
    }

    if (schemas.params) {
      request.params = schemas.params.parse(
        request.params,
      ) as Request['params'];
    }

    next();
  };
