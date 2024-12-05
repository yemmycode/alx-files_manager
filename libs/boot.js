import envLoader from '../utils/env_loader';

/**
 * Initializes and starts the server by loading the environment variables
 * and binding the application to the specified port.
 * @param {Express} api - The Express application to start the server.
 */
const startServer = (api) => {
  envLoader(); // Load environment variables
  const port = process.env.PORT || 5000; // Set port from environment or default to 5000
  const env = process.env.npm_lifecycle_event || 'dev'; // Determine the current environment

  // Start the server and log a message once it’s up and running
  api.listen(port, () => {
    console.log(`[${env}] Server is up and running on port:${port}`);
  });
};

export default startServer;
