import request from 'supertest';
import express from 'express';
import FilesController from './FilesController';  // adjust path accordingly
import dbClient from '../utils/db';  // adjust path accordingly
import { mockUser, mockFileData } from './mockData';  // you can create mock data here

jest.mock('../utils/db'); // Mock the db client to avoid actual DB calls

describe('FilesController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/upload', FilesController.postUpload);
    app.get('/files/:id', FilesController.getShow);
    app.get('/files', FilesController.getIndex);
    app.put('/files/:id/publish', FilesController.putPublish);
    app.put('/files/:id/unpublish', FilesController.putUnpublish);
    app.delete('/files/:id', FilesController.deleteFile);
  });

  afterEach(() => {
    jest.clearAllMocks();  // Clean up mocks between tests
  });

  // Test for File Upload
  test('should upload a file successfully', async () => {
    const mockResponse = {
      id: '12345',
      userId: mockUser._id.toString(),
      name: 'testFile.txt',
      type: 'file',
      isPublic: false,
      parentId: 0,
    };

    dbClient.filesCollection.mockReturnValue({
      insertOne: jest.fn().mockResolvedValue({ insertedId: mockResponse.id }),
    });

    const response = await request(app)
      .post('/upload')
      .send(mockFileData)  // mockFileData contains the necessary file data
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(mockResponse.id);
    expect(response.body.name).toBe('testFile.txt');
  });

  // Test for Getting a File by ID
  test('should return file details by id', async () => {
    const mockFile = {
      _id: '12345',
      userId: mockUser._id,
      name: 'testFile.txt',
      type: 'file',
      isPublic: false,
      parentId: 0,
    };

    dbClient.filesCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockFile),
    });

    const response = await request(app)
      .get('/files/12345')
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('testFile.txt');
  });

  // Test for File Not Found
  test('should return 404 for non-existing file', async () => {
    dbClient.filesCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
    });

    const response = await request(app)
      .get('/files/12345')
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not found');
  });

  // Test for Get All Files of a User
  test('should get all files for a user', async () => {
    const mockFiles = [
      {
        id: '12345',
        name: 'file1.txt',
        type: 'file',
        isPublic: false,
        parentId: 0,
      },
      {
        id: '67890',
        name: 'file2.txt',
        type: 'file',
        isPublic: true,
        parentId: 0,
      },
    ];

    dbClient.filesCollection.mockReturnValue({
      aggregate: jest.fn().mockResolvedValue(mockFiles),
    });

    const response = await request(app)
      .get('/files')
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe('file1.txt');
  });

  // Test for Publishing a File
  test('should publish a file successfully', async () => {
    const mockFile = {
      _id: '12345',
      userId: mockUser._id,
      name: 'testFile.txt',
      type: 'file',
      isPublic: false,
      parentId: 0,
    };

    dbClient.filesCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockFile),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    });

    const response = await request(app)
      .put('/files/12345/publish')
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(200);
    expect(response.body.isPublic).toBe(true);
  });

  // Test for Unpublishing a File
  test('should unpublish a file successfully', async () => {
    const mockFile = {
      _id: '12345',
      userId: mockUser._id,
      name: 'testFile.txt',
      type: 'file',
      isPublic: true,
      parentId: 0,
    };

    dbClient.filesCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockFile),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    });

    const response = await request(app)
      .put('/files/12345/unpublish')
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(200);
    expect(response.body.isPublic).toBe(false);
  });

  // Test for Deleting a File
  test('should delete a file successfully', async () => {
    const mockFile = {
      _id: '12345',
      userId: mockUser._id,
      name: 'testFile.txt',
      type: 'file',
      isPublic: false,
      parentId: 0,
    };

    dbClient.filesCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockFile),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    const response = await request(app)
      .delete('/files/12345')
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('Deleted');
  });

  // Test for Deleting a Non-existing File
  test('should return 404 when deleting non-existing file', async () => {
    dbClient.filesCollection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
    });

    const response = await request(app)
      .delete('/files/12345')
      .set('Authorization', `Bearer ${mockUser.token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not found');
  });
});

