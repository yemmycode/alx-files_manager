/* eslint-disable import/no-named-as-default */
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';

export default class AuthController {
  // Asynchronously handles user login and generates an authentication token
  static async getConnect(req, res) {
    const { user } = req; // Extract user details from the request object
    const token = uuidv4(); // Generate a unique token

    // Set the token in Redis with a 24-hour expiration time
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
    res.status(200).json({ token }); // Return the token in the response
  }

  // Asynchronously handles user logout by removing the token from Redis
  static async getDisconnect(req, res) {
    const token = req.headers['x-token']; // Get the token from request headers

    // Delete the token from Redis
    await redisClient.del(`auth_${token}`);
    res.status(204).send(); // Respond with status 204 to indicate successful logout
  }
}
