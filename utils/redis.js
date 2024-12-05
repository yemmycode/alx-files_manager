import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Encapsulates functionality for managing a Redis connection.
 */
class RedisClient {
  /**
   * Initializes a RedisClient instance and sets up connection listeners.
   */
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;

    this.client.on('error', (err) => {
      console.error(`Redis connection error: ${err.message || err}`);
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  /**
   * Determines whether the Redis client is currently connected.
   * @returns {boolean} True if the client is connected; otherwise, false.
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value associated with the specified key.
   * @param {String} key The key whose value is to be retrieved.
   * @returns {Promise<String | Object>} The value of the key, or null if not found.
   */
  async get(key) {
    const getAsync = promisify(this.client.GET).bind(this.client);
    return getAsync(key);
  }

  /**
   * Sets a key-value pair with an expiration time in seconds.
   * @param {String} key The key to be stored.
   * @param {String | Number | Boolean} value The value to associate with the key.
   * @param {Number} duration Expiration time in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    const setexAsync = promisify(this.client.SETEX).bind(this.client);
    await setexAsync(key, duration, value);
  }

  /**
   * Deletes the specified key and its associated value.
   * @param {String} key The key to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    const delAsync = promisify(this.client.DEL).bind(this.client);
    await delAsync(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;

