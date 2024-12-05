/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

// Create a new queue for email sending tasks
const userQueue = new Queue('email sending');

export default class UsersController {
  /**
   * Creates a new user with the provided email and password.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async postNew(req, res) {
    const email = req.body?.email || null;  // Retrieve email from request body
    const password = req.body?.password || null;  // Retrieve password from request body

    // Check if the email is provided
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if the password is provided
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    // Check if a user already exists with the provided email
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Insert the new user into the database after hashing the password
    const insertionResult = await (await dbClient.usersCollection()).insertOne({
      email, 
      password: sha1(password),
    });
    const userId = insertionResult.insertedId.toString();  // Get the inserted user's ID as a string

    // Add a job to the queue to send a confirmation email for the new user
    userQueue.add({ userId });

    // Respond with the user's email and ID
    res.status(201).json({ email, id: userId });
  }

  /**
   * Retrieves the logged-in user's details.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async getMe(req, res) {
    const { user } = req;  // Get the user from the request object

    // Respond with the user's email and ID
    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
