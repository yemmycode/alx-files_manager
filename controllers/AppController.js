/* eslint-disable import/no-named-as-default */
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  /**
   * Handles the status request and returns the health of Redis and Database.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static getStatus(req, res) {
    res.status(200).json({
      redis: redisClient.isAlive(),  // Checks if Redis is alive
      db: dbClient.isAlive(),        // Checks if the database is alive
    });
  }

  /**
   * Handles the statistics request and returns the count of users and files.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static getStats(req, res) {
    // Fetches the number of users and files concurrently
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([usersCount, filesCount]) => {
        res.status(200).json({ users: usersCount, files: filesCount });
      })
      .catch((error) => {
        // Handles errors if the Promise fails
        res.status(500).json({ error: 'Unable to fetch stats' });
      });
  }
}
