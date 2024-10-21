const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: '268685313629-ga0tef3pukq46plm7bem4c0v9g98du6h.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3001/api/user/google/callback',
    scope: ['profile', 'email']  // Request profile and email scopes
}, 
async (accessToken, refreshToken, profile, cb) => {
  try {

    const { id, displayName, emails, photos } = profile;

    let user = await User.findOne({ userID: id });
    
    if (!user) {
      user = new User({
        name: displayName,
        userID: id,
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
