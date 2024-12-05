/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class to handle API-specific errors.
 */
export class APIError extends Error {
  constructor(code, message) {
    super();
    this.code = code || 500; // Default to 500 if no code is provided.
    this.message = message;
  }
}

/**
 * Handles errors and sends a structured response to the client.
 * @param {Error} err The error instance that occurred.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The next middleware function in Express.
 */
export const errorResponse = (err, req, res, next) => {
  const defaultMessage = `Unable to process the request for ${req.url}`;

  if (err instanceof APIError) {
    res.status(err.code).json({ error: err.message || defaultMessage });
    return;
  }
  res.status(500).json({
    error: err?.message || err?.toString() || defaultMessage,
  });
};
