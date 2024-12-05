/* eslint-disable import/no-named-as-default */
import { writeFile } from 'fs';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import imgThumbnail from 'image-thumbnail';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './utils/db';
import Mailer from './utils/mailer';

const writeFileAsync = promisify(writeFile);
const fileQueue = new Queue('thumbnail generation');
const userQueue = new Queue('email sending');

/**
 * Creates a thumbnail for an image at a specified width.
 * @param {string} filePath The path to the original image file.
 * @param {number} size The width dimension for the thumbnail.
 * @returns {Promise<void>}
 */
const generateThumbnail = async (filePath, size) => {
  const buffer = await imgThumbnail(filePath, { width: size });
  console.log(`Creating thumbnail for: ${filePath}, size: ${size}`);
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

fileQueue.process(async (job, done) => {
  const { fileId = null, userId = null } = job.data;

  if (!fileId) {
    throw new Error('fileId is required');
  }
  if (!userId) {
    throw new Error('userId is required');
  }

  console.log('Processing job:', job.data.name || 'Unnamed Job');
  const file = await (await dbClient.filesCollection())
    .findOne({
      _id: new mongoDBCore.BSON.ObjectId(fileId),
      userId: new mongoDBCore.BSON.ObjectId(userId),
    });

  if (!file) {
    throw new Error('File not found in the database');
  }

  const sizes = [500, 250, 100];
  Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)))
    .then(() => {
      done();
    })
    .catch((err) => {
      done(err);
    });
});

userQueue.process(async (job, done) => {
  const { userId = null } = job.data;

  if (!userId) {
    throw new Error('userId is required');
  }

  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  if (!user) {
    throw new Error('User not found in the database');
  }

  console.log(`Sending welcome email to: ${user.email}`);
  try {
    const mailSubject = 'Welcome to ALX-Files_Manager by Yemi Ajibade';
    const mailContent = `
      <div>
        <h3>Hello ${user.name || 'User'},</h3>
        <p>Welcome to <a href="https://github.com/yemmycode/alx-files_manager">
        ALX-Files_Manager</a>, a simple file management API built with Node.js 
        by <a href="https://github.com/yemmycode/alx-files_manager">Yemi Ajibade</a>. 
        I do hope it meets your requirements.</p>
      </div>
    `;
    Mailer.sendMail(Mailer.buildMessage(user.email, mailSubject, mailContent));
    done();
  } catch (error) {
    done(error);
  }
});
