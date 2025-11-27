const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MASTER_DB = process.env.MASTER_DB || 'master_db';

let _client;

async function connect() {
  if (!_client) {
    _client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await _client.connect();
  }
  return _client.db(MASTER_DB);
}

async function createOrgCollection(db, collectionName) {
  const existing = await db.listCollections({ name: collectionName }).toArray();
  if (existing.length === 0) {
    await db.createCollection(collectionName);
  }
}

async function copyCollection(db, sourceName, targetName) {
  const source = db.collection(sourceName);
  const target = db.collection(targetName);
  const cursor = source.find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const copy = { ...doc };
    delete copy._id;
    await target.insertOne(copy);
  }
}

async function dropOrgCollection(db, collectionName) {
  const existing = await db.listCollections({ name: collectionName }).toArray();
  if (existing.length > 0) {
    await db.collection(collectionName).drop();
  }
}

module.exports = {
  connect,
  createOrgCollection,
  copyCollection,
  dropOrgCollection,
};
