import request from 'supertest';
import express from 'express';
import UsersController from './UsersController';  // adjust path accordingly
import dbClient from '../utils/db';  // adjust path accordingly
import Queue from 'bull/lib/queue';  // mock this as well

jest.mock('../utils/db');  // Mock the db client to avoid actual DB calls
jest.mock('bull/lib/queue');  // Mock the queue to avoid actual email sending

describe('UsersController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/users', UsersController.postNew);
    app.get('/me', UsersController.getMe);
  });

  afterEach(() => {
    jest.clearAllMocks();  // Clean up mocks between tests
  });

  // Test for Creating a New User - Success
  test('should create a new user successfully', async () => {
    const mockUser = { email: 'test@example.com', password: 'password123' };
    const mockUserId = 'newUserId';

    // Mock DB response for user existence check
    dbClient.usersCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null), // User doesn't exist
      insertOne: jest.fn().mockResolvedValue({ insertedId: { toString: () => mockUserId } }),
    });

    // Mock email queue to avoid actual email sending
    Queue.prototype.add = jest.fn();

    const response = await request(app)
      .post('/users')
      .send(mockUser);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(mockUser.email);
    expect(response.body.id).toBe(mockUserId);
    expect(Queue.prototype.add).toHaveBeenCalledWith({ userId: mockUserId });
  });

  // Test for Creating a New User - Email Already Exists
  test('should return an error if the email already exists', async () => {
    const mockUser = { email: 'test@example.com', password: 'password123' };

    // Mock DB response for user existence check
    dbClient.usersCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ email: mockUser.email }), // User already exists
    });

    const response = await request(app)
      .post('/users')
      .send(mockUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User already exists');
  });

  // Test for Creating a New User - Missing Email
  test('should return an error if email is missing', async () => {
    const mockUser = { password: 'password123' }; // Missing email

    const response = await request(app)
      .post('/users')
      .send(mockUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is required');
  });

  // Test for Creating a New User - Missing Password
  test('should return an error if password is missing', async () => {
    const mockUser = { email: 'test@example.com' }; // Missing password

    const response = await request(app)
      .post('/users')
      .send(mockUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Password is required');
  });

  // Test for Retrieving the Logged-in User Details
  test('should return the logged-in user details', async () => {
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    const mockReq = { user: mockUser };  // Simulating the request with a logged-in user

    // Mock the response for the `getMe` method
    const response = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer valid_token'); // Mock Authorization header

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(mockUser.email);
    expect(response.body.id).toBe(mockUser._id);
  });

  // Test for Missing User in Get Me Endpoint
  test('should return an error if user is not logged in', async () => {
    const mockReq = { user: null };  // Simulating no user logged in

    const response = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer invalid_token'); // Mock invalid token

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });
});
