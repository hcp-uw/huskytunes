const { getDb } = require('../db');
const bcrypt = require('bcrypt');

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

module.exports = {
  createUser,
  findUserByUsername,
  verifyPassword
};
