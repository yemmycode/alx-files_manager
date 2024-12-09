import AuthController from '../controllers/AuthController';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';

// Mock the dependencies
redisClient.set = async (key, value, duration) => `Mocked Redis set: ${key}, ${value}, ${duration}`;
redisClient.del = async (key) => `Mocked Redis del: ${key}`;

uuidv4.mockImplementation = () => 'mocked-token'; // Mock UUID generation

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
  res.send = function () {
    this.sent = true;
    return this;
  };
  return res;
}

// Tests
async function testGetConnect() {
  console.log('Testing getConnect...');
  const req = {
    user: { _id: '12345' }, // Mock request object with user details
  };
  const res = createResponse();

  await AuthController.getConnect(req, res);

  if (res.statusCode !== 200) {
    console.error('Expected status code 200, but got:', res.statusCode);
  }
  const expectedData = { token: 'mocked-token' };
  if (JSON.stringify(res.jsonData) !== JSON.stringify(expectedData)) {
    console.error('Expected JSON:', expectedData, 'but got:', res.jsonData);
  } else {
    console.log('getConnect test passed!');
  }
}

async function testGetDisconnect() {
  console.log('Testing getDisconnect...');
  const req = {
    headers: { 'x-token': 'mocked-token' }, // Mock request with token header
  };
  const res = createResponse();

  await AuthController.getDisconnect(req, res);

  if (res.statusCode !== 204) {
    console.error('Expected status code 204, but got:', res.statusCode);
  }
  if (!res.sent) {
    console.error('Expected response to be sent, but it was not.');
  } else {
    console.log('getDisconnect test passed!');
  }
}

// Run tests
(async () => {
  await testGetConnect();
  await testGetDisconnect();
})();
