/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { Request } from 'express';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './db';
import redisClient from './redis';

/**
 * Extracts the user from the Authorization header in the provided request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}>} The user if found, otherwise null.
 */
export const getUserFromAuthorization = async (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null; // No authorization header provided
  }

  const [scheme, credentials] = authorization.split(' ');

  if (scheme !== 'Basic' || !credentials) {
    return null; // Invalid authorization format
  }

  const decodedToken = Buffer.from(credentials, 'base64').toString();
  const separatorPosition = decodedToken.indexOf(':');
  const email = decodedToken.slice(0, separatorPosition);
  const password = decodedToken.slice(separatorPosition + 1);

  const user = await (await dbClient.usersCollection()).findOne({ email });

  if (!user || sha1(password) !== user.password) {
    return null; // User not found or password mismatch
  }

  return user; // Return the authenticated user
};

/**
 * Extracts the user using the X-Token header from the provided request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}>} The user if found, otherwise null.
 */
export const getUserFromXToken = async (req) => {
  const token = req.headers['x-token'];

  if (!token) {
    return null; // No X-Token header found
  }

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return null; // No user found for the provided token
  }

  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  return user || null; // Return the user or null if not found
};

export default {
  getUserFromAuthorization: async (req) => getUserFromAuthorization(req),
  getUserFromXToken: async (req) => getUserFromXToken(req),
};
