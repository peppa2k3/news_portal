import { AppError } from '../errors/app.error.js';

const postgresError = (error) => {
  switch (error.code) {
    case '23505':
      return new AppError(
        409,
        'A category with this slug already exists.',
        'CATEGORY_SLUG_CONFLICT',
      );
    case '23503':
      return new AppError(
        409,
        'The category is still referenced by other data.',
        'CATEGORY_IN_USE',
      );
    case '23514':
    case '22P02':
      return new AppError(400, 'Invalid category data.', 'INVALID_CATEGORY');
    case 'P0001':
      return new AppError(409, error.message, 'CATEGORY_TREE_CONFLICT');
    default:
      return null;
  }
};

export const notFoundHandler = (_request, response) => {
  response.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Route not found.',
    },
  });
};

export const errorHandler = (error, _request, response, _next) => {
  const handledError =
    error instanceof AppError ? error : postgresError(error);

  if (handledError) {
    return response.status(handledError.statusCode).json({
      error: {
        code: handledError.code,
        message: handledError.message,
        ...(handledError.details && { details: handledError.details }),
      },
    });
  }

  console.error(error);

  return response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error.',
    },
  });
};
