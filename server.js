import express from 'express';
import startServer from './libs/boot';
import injectRoutes from './routes';
import injectMiddlewares from './libs/middlewares';

// Initialize the Express application
const server = express();

// Inject middlewares into the server
injectMiddlewares(server);

// Inject routes into the server
injectRoutes(server);

// Start the server with the configured settings
startServer(server);

export default server;
