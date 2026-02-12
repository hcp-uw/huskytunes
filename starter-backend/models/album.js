const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

const collectionName = 'albums';

// Seed sample albums if none exist
async function seedSampleAlbum() {
  const db = getDb();
  const albums = db.collection(collectionName);

  const count = await albums.countDocuments();
  if (count === 0) {
    const now = new Date();
    await albums.insertMany([
      {
        title: 'The Glow Pt. 2',
        artist: 'The Microphones',
        year: 2001,
        cover: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Microphones_-_The_Glow_Pt._2_%282001_album%29_cover_art.jpg',
        genre: 'Indie Rock',
        createdAt: now
      },
      {
        title: 'In the Aeroplane Over the Sea',
        artist: 'Neutral Milk Hotel',
        year: 1998,
        cover: 'https://upload.wikimedia.org/wikipedia/en/5/5f/In_the_aeroplane_over_the_sea_album_cover_copy.jpg',
        genre: 'Indie Folk',
        createdAt: now
      },
      {
        title: 'Kid A',
        artist: 'Radiohead',
        year: 2000,
        cover: 'https://upload.wikimedia.org/wikipedia/en/0/02/Radiohead.kida.albumart.jpg',
        genre: 'Experimental Rock',
        createdAt: now
      }
    ]);
    console.log('Seeded sample albums: The Glow Pt. 2 and others');
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
