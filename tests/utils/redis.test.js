/* eslint-disable import/no-named-as-default */
import { expect } from 'chai';
import redisClient from '../../utils/redis';

describe('+ RedisClient utility', () => {
  before(function (done) {
    this.timeout(10000);
    setTimeout(() => done(), 4000);
  });

  it('+ Client is alive', () => {
    const clientAlive = redisClient.isAlive();
    expect(clientAlive).to.equal(true);
  });

  it('+ Setting and getting a value', async function () {
    await redisClient.set('test_key', 345, 10);
    const value = await redisClient.get('test_key');
    expect(value).to.equal('345');
  });

  it('+ Setting and getting an expired value', async function () {
    await redisClient.set('test_key', 356, 1);
    setTimeout(async () => {
      const value = await redisClient.get('test_key');
      expect(value).to.not.equal('356');
    }, 2000);
  });

  it('+ Setting and getting a deleted value', async function () {
    await redisClient.set('test_key', 345, 10);
    await redisClient.del('test_key');
    setTimeout(async () => {
      const deletedValue = await redisClient.get('test_key');
      console.log('del: test_key ->', deletedValue);
      expect(deletedValue).to.be.null;
    }, 2000);
  });
});
