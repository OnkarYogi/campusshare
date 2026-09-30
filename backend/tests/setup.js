const mongoose = require('mongoose');

beforeAll(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
