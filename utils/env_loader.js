import { existsSync, readFileSync } from 'fs';

/**
 * Loads the relevant environment variables for a specific event.
 */
const envLoader = () => {
  const env = process.env.npm_lifecycle_event || 'dev';
  const path = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(path)) {
    const data = readFileSync(path, 'utf-8').trim().split('\n');

    data.forEach(line => {
      const delimPosition = line.indexOf('=');
      const variable = line.substring(0, delimPosition);
      const value = line.slice(delimPosition + 1);
      process.env[variable] = value;
    });
  }
};

export default envLoader;
