const express = require("express")
const cors = require("cors")
const { unknownEndpoint } = require('./middleware');
const { connect, client} = require('./db');  // database connection

// create your express application
const app = express();

// enable json parsing
app.use(express.json());

// enable cors
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  // session middleware - stores sessions in MongoDB
app.use(session({
secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
resave: false,
saveUninitialized: false,
store: MongoStore.create({ client }),
cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week
}
}));
// our 'database'. This is just a simple in-memory store for the images, and
// will be lost when the server is restarted. In a real application, you would
// use a database to store the images.
const images = [];

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

// error handling
app.use(unknownEndpoint);

// set port to listen on
const PORT = 3001;

// start your server
connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });