const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLECLIENTID,
    clientSecret: process.env.GOOGLESECRET,
    callbackURL: process.env.GOOGLEURL,
    scope: ['profile', 'email'] 
}, 
async (accessToken, refreshToken, profile, cb) => {
  try {

    const { id, displayName, emails, photos } = profile;

    let user = await User.findOne({ googleId: id });
    
    if (!user) {
      user = new User({
        name: displayName,
        googleId: id,
        email: emails[0].value,
        avatar: {
          public_id: null, 
          url: photos[0].value 
        },
        number: '', 
        description: '', 
        userType: 'default', 
        regNumber: null, 
        files: [] 
      });
      await user.save();
    }

    return cb(null, user);
    
  } catch (err) {
    return cb(err, null);
  }
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
