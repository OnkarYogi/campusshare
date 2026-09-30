const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  global.__MONGOD__ = instance;
  process.env.MONGO_URI = uri;
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';
};
