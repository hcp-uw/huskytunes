const express = require("express")
const cors = require("cors")
const session = require("express-session")
const MongoStore = require("connect-mongo").default
const { unknownEndpoint } = require('./middleware');
const { requireAuth } = require('./middleware/auth');
const { connect } = require('./db');  // database connection
const { createUser, findUserByUsername, verifyPassword } = require('./models/user');
const path = require('path');
const {
  seedSampleAlbum,
  getAllAlbums,
  getAlbumById,
  getAlbumRatings,
  getAlbumAverageRating,
  rateAlbum,
  getUserRating,
  ensureAlbum
} = require('./models/album');
const { searchAlbums, getAlbumDetails } = require('./services/spotify');
// Prefer .env in backend folder; fall back to project root
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// create your express application
const app = express();

// enable json parsing
app.use(express.json());

// enable cors
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  }));
  // session middleware - stores sessions in MongoDB
app.use(session({
secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
resave: false,
saveUninitialized: false,
store: MongoStore.create({
  mongoUrl: process.env.MONGODB_URI
}),
cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week
}
}));
// our 'database'. This is just a simple in-memory store for the images, and
// will be lost when the server is restarted. In a real application, you would
// use a database to store the images.
const images = [];

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    await createUser(username, password);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.message === 'Username already exists') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Registration error:', error);
    // Send more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set session
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    
    res.json({ 
      message: 'Login successful',
      user: { username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ 
    user: { 
      username: req.session.username 
    } 
  });
});

// Admin endpoint to view all users (for development only - remove in production!)
app.get('/api/admin/users', async (req, res) => {
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const users = db.collection('users');
    
    // Get all users (excluding passwords for security)
    const allUsers = await users.find({}, { projection: { password: 0 } }).toArray();
    
    res.json({ 
      count: allUsers.length,
      users: allUsers 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// test endpoint
app.get('/message/hello', (req, res) => {
    res.send(
        `Attention HCP Project Team! If you see this, your front end and
        back end are connected. Don't believe me? Upload and image and
        see for yourself!`
    )
})

app.post('/image/upload', (req, res) => {
    console.log(req.body);
    const base64ImgData = req.body.image;
    images.push(base64ImgData);
    res.status(201).send('Image uploaded');
})

app.get('/image/featured', (req, res) => {
    res.send(images);
})

// Album routes

// Get all albums with their average ratings
app.get('/api/albums', async (req, res) => {
  try {
    const albums = await getAllAlbums();

    // The aggregation already provides counts and averages, 
    // but we still need to check the current user's rating for each (if logged in)
    const albumsWithUserRatings = await Promise.all(
      albums.map(async (album) => {
        let userRating = null;
        if (req.session && req.session.userId) {
          const ratingDoc = await getUserRating(album._id.toString(), req.session.userId);
          userRating = ratingDoc ? ratingDoc.score : null;
        }
        
        return {
          ...album,
          averageRating: album.averageRating || 0,
          totalRatings: album.totalRatings || 0,
          userRating: userRating
        };
      })
    );

    res.json(albumsWithUserRatings);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

// Get a single album with its ratings
app.get('/api/albums/:id', async (req, res) => {
  try {
    const album = await getAlbumById(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const ratingInfo = await getAlbumAverageRating(album._id.toString());
    const ratings = await getAlbumRatings(album._id.toString());
    
    let userRating = null;
    let review = null;
    if (req.session && req.session.userId) {
      const ratingDoc = await getUserRating(album._id.toString(), req.session.userId);
      userRating = ratingDoc ? ratingDoc.score : null;
      review = ratingDoc ? ratingDoc.review : null;
    }

    res.json({
      ...album,
      averageRating: ratingInfo.average,
      totalRatings: ratingInfo.count,
      ratings: ratings.map(r => ({
        username: r.username,
        score: r.score,
        review: r.review,
        updatedAt: r.updatedAt,
        isMine: req.session && req.session.userId ? r.userId === req.session.userId : false
      })),
      userRating: userRating,
      review: review
    });
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

// Rate an album (score 1–10)
app.post('/api/albums/:id/rate', requireAuth, async (req, res) => {
  try {
    const { score, review, albumData } = req.body;
    console.log('Received rate request for ID:', req.params.id);
    console.log('Body:', { score, review, hasAlbumData: !!albumData });

    if (!score || score < 1 || score > 10 || !Number.isInteger(score)) {
      return res.status(400).json({ error: 'Score must be an integer between 1 and 10' });
    }

    // Ensure the album exists in our database first
    let album;
    if (albumData) {
      console.log('Using albumData to ensure album exists');
      album = await ensureAlbum(albumData);
    } else {
      console.log('Searching for album by ID:', req.params.id);
      album = await getAlbumById(req.params.id);
    }

    if (!album) {
      console.log('Album not found after ensure/search');
      return res.status(404).json({ error: 'Album not found' });
    }

    const albumId = album._id.toString();
    console.log('Rating album with DB ID:', albumId);

    await rateAlbum(
      albumId,
      req.session.userId,
      req.session.username,
      score,
      review
    );

    // Return updated rating info
    const ratingInfo = await getAlbumAverageRating(albumId);

    res.json({
      message: 'Rating submitted',
      averageRating: ratingInfo.average,
      totalRatings: ratingInfo.count,
      userRating: score,
      review: review
    });
  } catch (error) {
    console.error('Error rating album:', error);
    res.status(500).json({ error: 'Failed to submit rating: ' + error.message });
  }
});

// Delete a rating
app.delete('/api/albums/:id/rate', requireAuth, async (req, res) => {
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const ratings = db.collection('ratings');
    const albums = db.collection('albums');
    const albumId = req.params.id;
    const userId = req.session.userId;

    console.log('Delete request for albumId:', albumId, 'userId:', userId);

    // Find the album first to get its real DB ID if a spotifyId was passed
    let targetAlbumId = albumId;
    if (albumId.length !== 24) {
      const album = await albums.findOne({ spotifyId: albumId });
      if (album) {
        targetAlbumId = album._id.toString();
      }
    }

    const result = await ratings.deleteOne({ albumId: targetAlbumId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Return updated rating info
    const ratingInfo = await getAlbumAverageRating(targetAlbumId);

    res.json({
      message: 'Rating deleted',
      averageRating: ratingInfo.average,
      totalRatings: ratingInfo.count
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

// Spotify search
app.get('/api/spotify/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const results = await searchAlbums(q);
    
    // For each Spotify result, check if we have local ratings/data
    const resultsWithLocalData = await Promise.all(
      results.map(async (album) => {
        // Try to find the album in our DB by spotifyId
        const localAlbum = await getAlbumById(album.spotifyId);
        if (localAlbum) {
          const ratingInfo = await getAlbumAverageRating(localAlbum._id.toString());
          
          let userRating = null;
          let review = null;
          if (req.session && req.session.userId) {
            const ratingDoc = await getUserRating(localAlbum._id.toString(), req.session.userId);
            userRating = ratingDoc ? ratingDoc.score : null;
            review = ratingDoc ? ratingDoc.review : null;
          }

          return {
            ...album,
            _id: localAlbum._id,
            averageRating: ratingInfo.average,
            totalRatings: ratingInfo.count,
            userRating: userRating,
            review: review
          };
        }
        return album;
      })
    );
    
    res.json(resultsWithLocalData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Spotify album details
app.get('/api/spotify/albums/:id', async (req, res) => {
  try {
    const details = await getAlbumDetails(req.params.id);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// error handling
app.use(unknownEndpoint);

// set port to listen on
const PORT = 3001;

// start your server
connect()
  .then(async () => {
    // Seed sample album data if the albums collection is empty
    await seedSampleAlbum();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
