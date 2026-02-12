const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

const collectionName = 'albums';

// Seed a sample album if none exist
async function seedSampleAlbum() {
  const db = getDb();
  const albums = db.collection(collectionName);

  const count = await albums.countDocuments();
  if (count === 0) {
    await albums.insertOne({
      title: 'Abbey Road',
      artist: 'The Beatles',
      year: 1969,
      cover: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg',
      genre: 'Rock',
      createdAt: new Date()
    });
    console.log('Seeded sample album: Abbey Road');
  }
}

// Get all albums with their average ratings
async function getAllAlbums() {
  const db = getDb();
  const albums = db.collection(collectionName);
  return await albums.find({}).toArray();
}

// Get a single album by ID
async function getAlbumById(albumId) {
  const db = getDb();
  const albums = db.collection(collectionName);
  return await albums.findOne({ _id: new ObjectId(albumId) });
}

// Get all ratings for an album
async function getAlbumRatings(albumId) {
  const db = getDb();
  const ratings = db.collection('ratings');
  return await ratings.find({ albumId: albumId }).toArray();
}

// Get the average rating for an album
async function getAlbumAverageRating(albumId) {
  const db = getDb();
  const ratings = db.collection('ratings');

  const result = await ratings.aggregate([
    { $match: { albumId: albumId } },
    {
      $group: {
        _id: '$albumId',
        average: { $avg: '$score' },
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  if (result.length === 0) {
    return { average: 0, count: 0 };
  }

  return {
    average: Math.round(result[0].average * 10) / 10,
    count: result[0].count
  };
}

// Add or update a rating for an album by a user
async function rateAlbum(albumId, userId, username, score) {
  const db = getDb();
  const ratings = db.collection('ratings');

  // Upsert: update if the user already rated this album, insert otherwise
  const result = await ratings.updateOne(
    { albumId: albumId, userId: userId },
    {
      $set: {
        albumId: albumId,
        userId: userId,
        username: username,
        score: score,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  return result;
}

// Get a specific user's rating for an album
async function getUserRating(albumId, userId) {
  const db = getDb();
  const ratings = db.collection('ratings');
  return await ratings.findOne({ albumId: albumId, userId: userId });
}

module.exports = {
  seedSampleAlbum,
  getAllAlbums,
  getAlbumById,
  getAlbumRatings,
  getAlbumAverageRating,
  rateAlbum,
  getUserRating
};
