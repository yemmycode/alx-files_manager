import express from 'express';

/**
 * Attaches middlewares to the provided Express application.
 * @param {express.Express} api The Express application instance.
 */
const injectMiddlewares = (api) => {
  // Apply middleware to parse incoming JSON with a limit of 200mb
  api.use(express.json({ limit: '500mb' }));
};

export default injectMiddlewares;
