const { getDb } = require('../db');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

// User model/utilities for MongoDB operations
const collectionName = 'users';

async function createUser(username, password) {
  try {
    const db = getDb();
    const users = db.collection(collectionName);
    
    // Check if user already exists
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const result = await users.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    return result.insertedId;
  } catch (error) {
    // Re-throw with more context if it's a database connection error
    if (error.message.includes('Database not connected')) {
      throw new Error('Database connection error. Please try again.');
    }
    throw error;
  }
}

async function findUserByUsername(username) {
  const db = getDb();
  const users = db.collection(collectionName);
  return await users.findOne({ username });
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/** Case-insensitive username substring search. Excludes current user id when provided. */
async function searchUsersByUsername(query, excludeUserId) {
  const db = getDb();
  const users = db.collection(collectionName);
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return [];
  }
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = {
    username: { $regex: escaped, $options: 'i' }
  };
  if (excludeUserId && ObjectId.isValid(excludeUserId)) {
    filter._id = { $ne: new ObjectId(excludeUserId) };
  }
  const results = await users
    .find(filter, { projection: { password: 0 } })
    .limit(24)
    .toArray();

  return results.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    createdAt: u.createdAt || null
  }));
}

module.exports = {
  createUser,
  findUserByUsername,
  verifyPassword,
  searchUsersByUsername
};
