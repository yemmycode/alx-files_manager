/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db';

describe('+ DBClient utility', () => {
  before(function (done) {
    this.timeout(10000);
    dbClient.usersCollection()
      .then((usersCollection) => {
        dbClient.filesCollection()
          .then((filesCollection) => {
            Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
              .then(() => done())
              .catch((deleteErr) => done(deleteErr));
          })
          .catch((filesCollectionErr) => done(filesCollectionErr));
      })
      .catch((usersCollectionErr) => done(usersCollectionErr));
  });

  it('+ Client is alive', () => {
    expect(dbClient.isAlive()).to.equal(true);
  });

  it('+ nbUsers returns the correct value', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(usersCount).to.equal(0);
  });

  it('+ nbFiles returns the correct value', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(filesCount).to.equal(0);
  });
});
