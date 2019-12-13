const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();

app.use(cors());

const Models = require('./models/schema');
const models = Models(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/movies_db');

const MoviesAPI = require('./api/movies-api');
const moviesAPI = MoviesAPI(models);

app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

const PORT = process.env.PORT || 5002;

app.get('/', moviesAPI.home);
app.get('/verify', moviesAPI.verify);
app.get('/logout', moviesAPI.logout);

app.get('/users', moviesAPI.allUsers);
app.get('/movies/:username', moviesAPI.allPlaylist);
app.get('/playlist/:username', moviesAPI.allPlaylist);
app.get('/profile/:username', moviesAPI.viewProfile);

app.post('/signUp', moviesAPI.addUser);
app.post('/signin', moviesAPI.login);

app.post('/profile/:username', moviesAPI.updateProfile);
app.post('/movies/:username/add', moviesAPI.addToPlaylist);
app.post('/playlist/:username/:movieId', moviesAPI.removeFromPlaylist);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
