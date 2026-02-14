const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

const collectionName = 'albums';

// Seed sample albums if none exist
async function seedSampleAlbum() {
  // We no longer seed sample albums to keep the site focused on API-driven content
  return;
}

// Get all albums with their average ratings
async function getAllAlbums() {
  const db = getDb();
  const albums = db.collection(collectionName);
  const ratings = db.collection('ratings');

  console.log('getAllAlbums: Fetching albums with ratings...');

  // Use aggregation to get all albums and their rating counts
  const albumsWithCounts = await albums.aggregate([
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'albumId',
        as: 'albumRatings'
      }
    },
    // Fallback lookup: also check if ratings are linked via string albumId
    {
      $lookup: {
        from: 'ratings',
        let: { album_id_str: { $toString: "$_id" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$albumId", "$$album_id_str"] } } }
        ],
        as: 'albumRatingsStr'
      }
    },
    {
      $addFields: {
        allRatings: { $concatArrays: ["$albumRatings", "$albumRatingsStr"] }
      }
    },
    {
      $addFields: {
        totalRatings: { $size: '$allRatings' },
        averageRating: { $avg: '$allRatings.score' }
      }
    },
    {
      $match: { totalRatings: { $gt: 0 } }
    },
    { $sort: { totalRatings: -1, averageRating: -1 } },
    { $limit: 10 }
  ]).toArray();

  console.log(`getAllAlbums: Found ${albumsWithCounts.length} albums with ratings.`);

  // Convert ObjectId to string for consistency
  return albumsWithCounts.map(album => ({
    ...album,
    _id: album._id.toString()
  }));
}

// Get a single album by ID
async function getAlbumById(albumId) {
  const db = getDb();
  const albums = db.collection(collectionName);
  
  console.log('getAlbumById called with:', albumId);

  // Try finding by spotifyId first
  let album = await albums.findOne({ spotifyId: albumId });
  if (album) return album;

  // Only try to convert to ObjectId if it's a valid 24-character hex string
  if (typeof albumId === 'string' && albumId.length === 24) {
    try {
      return await albums.findOne({ _id: new ObjectId(albumId) });
    } catch (e) {
      console.log('Invalid ObjectId format in getAlbumById:', albumId);
    }
  }
  
  return null;
}

// Get all ratings for an album
async function getAlbumRatings(albumId) {
  const db = getDb();
  const ratings = db.collection('ratings');
  
  // Try matching by both ObjectId and string representation
  const query = {
    $or: [
      { albumId: albumId },
      { albumId: albumId.length === 24 ? new ObjectId(albumId) : albumId }
    ]
  };
  
  return await ratings.find(query).toArray();
}

// Get the average rating for an album
async function getAlbumAverageRating(albumId) {
  const db = getDb();
  const ratings = db.collection('ratings');

  // Try matching by both ObjectId and string representation
  const matchQuery = {
    $or: [
      { albumId: albumId },
      { albumId: albumId.length === 24 ? new ObjectId(albumId) : albumId }
    ]
  };

  const result = await ratings.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
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
async function rateAlbum(albumId, userId, username, score, review = '') {
  const db = getDb();
  const ratings = db.collection('ratings');

  console.log('Backend rateAlbum called with:', { albumId, userId, username, score, review });

  const updateData = {
    albumId: albumId,
    userId: userId,
    username: username,
    score: score,
    updatedAt: new Date()
  };

  // Only include review if it's not empty
  if (review && review.trim().length > 0) {
    updateData.review = review.trim();
  }

  // Upsert: update if the user already rated this album, insert otherwise
  const result = await ratings.updateOne(
    { albumId: albumId, userId: userId },
    {
      $set: updateData,
      $setOnInsert: {
        createdAt: new Date()
      },
      // If the new review is empty, remove the existing review field
      ...(!review || review.trim().length === 0 ? { $unset: { review: "" } } : {})
    },
    { upsert: true }
  );

  return result;
}

// Get a specific user's rating for an album
async function getUserRating(albumId, userId) {
  const db = getDb();
  const ratings = db.collection('ratings');
  
  const query = {
    $and: [
      { userId: userId },
      {
        $or: [
          { albumId: albumId },
          { albumId: albumId.length === 24 ? new ObjectId(albumId) : albumId }
        ]
      }
    ]
  };
  
  return await ratings.findOne(query);
}

// Ensure album exists in DB (for Spotify albums)
async function ensureAlbum(albumData) {
  try {
    const db = getDb();
    const albums = db.collection(collectionName);
    
    const spotifyId = albumData.spotifyId;
    const mongoId = albumData._id;

    console.log('Backend ensureAlbum called with:', { spotifyId, mongoId });
    
    // Try to find by spotifyId first
    let album = null;
    if (spotifyId) {
      album = await albums.findOne({ spotifyId: spotifyId });
    }
    
    // If not found by spotifyId, try by _id if it's a valid ObjectId
    if (!album && mongoId && typeof mongoId === 'string' && mongoId.length === 24) {
      try {
        album = await albums.findOne({ _id: new ObjectId(mongoId) });
      } catch (e) {
        console.log('Invalid ObjectId format:', mongoId);
      }
    }

    if (!album) {
      console.log('Album not found in DB, creating new entry for:', albumData.title);
      const newAlbum = {
        title: albumData.title,
        artist: albumData.artist,
        year: parseInt(albumData.year) || 0,
        cover: albumData.cover,
        genre: albumData.genre || 'Music',
        spotifyId: albumData.spotifyId || null,
        createdAt: new Date()
      };
      const result = await albums.insertOne(newAlbum);
      return { ...newAlbum, _id: result.insertedId };
    }

    return album;
  } catch (error) {
    console.error('Error in ensureAlbum:', error);
    throw error;
  }
}

module.exports = {
  seedSampleAlbum,
  getAllAlbums,
  getAlbumById,
  getAlbumRatings,
  getAlbumAverageRating,
  rateAlbum,
  getUserRating,
  ensureAlbum
};
