const mongoose = require('mongoose');

module.exports = function (mongoUrl) {
  mongoose.Promise = global.Promise;
  mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);


  const User = mongoose.model('User', {
    firstName: { type: String, required: true, },
    lastName: { type: String, required: true, },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, bcrypt: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: '' },
    active: { type: Boolean },
    timestamp: {
      created: { type: Date, default: Date.now() },
      lastSeen: { type: Date, default: Date.now() },
    }
  });

  const Playlist = mongoose.model('Playlist', {
    userId: { type: String },
    popularity: { type: Number },
    vote_count: { type: Number },
    poster_path: { type: String },
    backdrop_path: { type: String },
    original_title: { type: String },
    title: { type: String },
    vote_average: { type: Number },
    overview: { type: String },
    adult: { type: Boolean },
    video: { type: Boolean },
    release_date: { type: Date }
  });

  const UserSession = mongoose.model('UserSession', {
    userId: { type: String, default: -1 },
    timestamp: { type: Date, default: Date.now() },
    isDeleted: { type: Boolean, default: false }
  });


  return {
    User,
    Playlist,
    UserSession
    
  };
};