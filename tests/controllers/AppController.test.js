import AppController from '../controllers/AppController';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Mock the dependencies
redisClient.isAlive = () => true;
dbClient.isAlive = () => true;
dbClient.nbUsers = () => Promise.resolve(5);
dbClient.nbFiles = () => Promise.resolve(10);

// Helper to simulate a response object
function createResponse() {
  const res = {};
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    this.jsonData = data;
    return this;
  };
  return res;
}

// Tests
function testGetStatus() {
  console.log('Testing getStatus...');
  const req = {}; // Mock request object
  const res = createResponse();

  AppController.getStatus(req, res);

  if (res.statusCode !== 200) {
    console.error('Expected status code 200, but got:', res.statusCode);
  }
  const expectedData = { redis: true, db: true };
  if (JSON.stringify(res.jsonData) !== JSON.stringify(expectedData)) {
    console.error('Expected JSON:', expectedData, 'but got:', res.jsonData);
  } else {
    console.log('getStatus test passed!');
  }
}

async function testGetStatsSuccess() {
  console.log('Testing getStats (success)...');
  const req = {}; // Mock request object
  const res = createResponse();

  await AppController.getStats(req, res);

  if (res.statusCode !== 200) {
    console.error('Expected status code 200, but got:', res.statusCode);
  }
  const expectedData = { users: 5, files: 10 };
  if (JSON.stringify(res.jsonData) !== JSON.stringify(expectedData)) {
    console.error('Expected JSON:', expectedData, 'but got:', res.jsonData);
  } else {
    console.log('getStats (success) test passed!');
  }
}

async function testGetStatsError() {
  console.log('Testing getStats (error)...');
  dbClient.nbUsers = () => Promise.reject(new Error('Database error'));

  const req = {}; // Mock request object
  const res = createResponse();

  await AppController.getStats(req, res);

  if (res.statusCode !== 500) {
    console.error('Expected status code 500, but got:', res.statusCode);
  }
  const expectedData = { error: 'Unable to fetch stats' };
  if (JSON.stringify(res.jsonData) !== JSON.stringify(expectedData)) {
    console.error('Expected JSON:', expectedData, 'but got:', res.jsonData);
  } else {
    console.log('getStats (error) test passed!');
  }
}

// Run tests
testGetStatus();
testGetStatsSuccess();
testGetStatsError();
