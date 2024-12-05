import mongodb from 'mongodb';
// eslint-disable-next-line no-unused-vars
import Collection from 'mongodb/lib/collection';
import envLoader from './env_loader'; // Ensure the path is correct

/**
 * Manages the MongoDB client and database interactions.
 */
class DBClient {
  /**
   * Initializes a new instance of DBClient and connects to the database.
   */
  constructor() {
    envLoader();
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;

    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.client.connect().catch((err) => {
      console.error('MongoDB connection error:', err.message || err.toString());
    });
  }

  /**
   * Verifies if the MongoDB client is connected to the server.
   * @returns {boolean} True if the client is connected; otherwise, false.
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Counts the number of documents in the `users` collection.
   * @returns {Promise<number>} The count of users in the database.
   */
  async nbUsers() {
    return await this.client.db().collection('users').countDocuments();
  }

  /**
   * Counts the number of documents in the `files` collection.
   * @returns {Promise<number>} The count of files in the database.
   */
  async nbFiles() {
    return await this.client.db().collection('files').countDocuments();
  }

  /**
   * Provides access to the `users` collection.
   * @returns {Promise<Collection>} A reference to the `users` collection.
   */
  async usersCollection() {
    return this.client.db().collection('users');
  }

  /**
   * Provides access to the `files` collection.
   * @returns {Promise<Collection>} A reference to the `files` collection.
   */
  async filesCollection() {
    return this.client.db().collection('files');
  }
}

export const dbClient = new DBClient();
export default dbClient;
