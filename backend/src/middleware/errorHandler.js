import { AppError } from '../utils/errors.js';

export const notFoundHandler = (req, res, next) => {
  next(new AppError('Not found', 404));
};

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal server error',
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production' && status === 500) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
