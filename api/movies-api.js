const bcrypt = require('bcrypt');

module.exports = function (models) {
  const User = models.User;
  const Playlist = models.Playlist;
  const UserSession = models.UserSession;

  const home = (req, res) => {
    res.send('<h1>Happy days</h1>');
  };
  /* 
    Signup
  */
  const addUser = async (req, res, next) => {
    try {
      const { body } = req;
      console.log("BODY: ", body);
      let { firstName, lastName, username, password, email, image, active, timestamp } = body;

      if (!firstName) {
        return res.json({ success: false, message: "Error: firstname cannot be blank." });
      }
      if (!lastName) {
        return res.json({ success: false, message: "Error: lastName cannot be blank." });
      }
      if (!username) {
        return res.json({ success: false, message: "Error: username cannot be blank." });
      }
      if (!password) {
        return res.json({ success: false, message: "Error: password cannot be blank." });
      }
      if (!email) {
        return res.json({ success: false, message: "Error: email cannot be blank." });
      }

      email = email.toLowerCase();

      // Verify email existance
      // Save
      const user = await User.find({ email: email });

      if (user.length > 0) { // Checks if user already exist
        return res.json({
          success: false,
          message: "Error: Account already exists.",
        });
      }

      // Store hash in a password DB.
      let hash = bcrypt.hashSync(password, 8);

      // Save new User
      const newUser = new User();

      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.username = username;
      newUser.password = hash;
      newUser.email = email;
      newUser.image = image;
      newUser.active = active;
      newUser.timestamp = timestamp;

      newUser.save((err, user) => {
        if (err) {
          res.json({
            success: false,
            message: "Error: Server error",
            errors: err
          });
        }

        res.json({
          success: true,
          message: "Signed up"
        });
      });
    }
    catch (error) {
      next(error);
    }
  };

  /*
    Login
  */
  const login = async function (req, res, next) {

    try {
      const { body } = req;
      let { email, username, password } = body;

      if (!username) {
        return res.json({ success: false, message: "Error: username cannot be blank." });
      }
      if (!password) {
        return res.json({ success: false, message: "Error: password cannot be blank." });
      }
      // if (!email) {
      //   return res.json({ success: false, message: "Error: email cannot be blank." });
      // }

      //email = email.toLowerCase();

      const user = await User.find({ username: username });
      
      if (user) {
        const match = await bcrypt.compare(password, user[0].password);

        if (match && username === user[0].username) {
          const userSession = new UserSession();
          userSession.userId = user._id;

          userSession.save((err, doc) => {
            if (err) {
              return res.status(401).json({
                success: false,
                message: "Error: server error"
              });
            }

            res.json({
              success: true,
              message: "Logged in...",
              token: doc._id
            });

          });

        } else {
          res.json({
            success: false,
            message: "Invalid login details"
          });
        }
      }
      else {
        return res.status(401).json({
          message: "Authentication failed"
        });
      }
    }
    catch (error) {
      return res.status(401).json({
        message: "Authentication failed"
      });
    }

  };

  /*
    Verify
  */
  const verify = async function (req, res, next) {
    // Get the token;
    const { query } = req;
    const { token } = query;

    // verify if token is one of a kind
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {
      if (err) {
        return res.json({
          success: false,
          message: "Error: Server error"
        });
      }

      if(sessions.length != 1) {
        return res.json({
          success: false,
          message: "Error: Invalid"
        });
      } else {
        return res.json({
          success: true,
          message: "Good Token"
        });
      }
    });
    
  };

  /*
    Verify
  */
  const logout = async function (req, res, next) {
    // Get the token;
    const { query } = req;
    const { token } = query;

    // verify if token is one of a kind
    UserSession.findOneAndUpdate({
      _id: token,
      isDeleted: false
    }, {
      $set: { isDeleted: true }
    }, null, (err, session) => {
      if (err) {
        return res.json({
          success: false,
          message: "Error: Server error"
        });
      }
      return res.json({
        success: true,
        message: "Successfully logged out"
      });
    });
  };

  /*
    All Users
  */
  const allUsers = async function (req, res, next) {
    try {
      const users = await User.find();

      res.json({
        status: "success",
        data: users
      });
    }
    catch (err) {
      next(err);
    }
  };


  /*
    Add (addToPlaylist) one movie to loggedin user playlist
  */
  const addToPlaylist = async function (req, res, next) {
    try {
      const { body } = req;
      const { popularity, vote_count, video, poster_path, userId, adult, backdrop_path, original_title, title, vote_average, overview, release_date } = body;

      const { username } = req.params;
      const user = await User.findOne({ username });



      await Playlist.create({
        popularity: req.body.popularity,
        vote_count: req.body.vote_count,
        video: req.body.video,
        poster_path: req.body.poster_path,
        userId: user._id,
        adult: req.body.adult,
        backdrop_path: req.body.backdrop_path,
        original_title: req.body.original_title,
        title: req.body.title,
        vote_average: req.body.vote_average,
        overview: req.body.overview,
        release_date: new Date()
      });

      res.json({
        status: "success",
      });
    }
    catch (err) {
      console.log(err);
    }

  };

  const allPlaylist = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = (await User.find({ username }));

      if (user && user[0].username) {
        var data = await Playlist.find({ userId: user[0]._id });
      }

      res.json({
        status: "success",
        data: data
      });
    }
    catch (err) {
      next(err);
    }
  };

  const viewProfile = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });

      const data = await User.find({ _id: user._id });

      res.json({
        status: "success",
        data: data
      });

    } catch (err) {
      next(err);
    }
  };

  const updateProfile = async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username })

      await User.update(
        { '_id': user._id },
        {
          $set:
            { 'firstName': 'New Name Again' },
        }
      );

      res.json({
        status: "success",
      });
    }
    catch (err) {
      next(err);
    }

  };

  const removeFromPlaylist = async (req, res, next) => {
    try {
      const { username } = req.params;
      const { movieId } = req.params;

      await Playlist.deleteOne({ _id: movieId });

      const user = await User.find({ username });
      const data = await Playlist.find({ userId: user._id });

      res.json({
        status: "success",
        data: movieId
      });
    }
    catch (err) {
      res.json({
        error: err
      });
    }
  };



  return {
    //all,
    home,
    allUsers,
    addUser,
    login,
    verify,
    logout,

    addToPlaylist,
    allPlaylist,
    viewProfile,
    updateProfile,
    removeFromPlaylist
  };
};
