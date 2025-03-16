const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config();

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
 clientID: process.env.GOOGLECLIENTID,     // Google OAuth client ID from environment variables
 clientSecret: process.env.GOOGLESECRET,   // Google OAuth client secret from environment variables
 callbackURL: process.env.GOOGLEURL,       // Callback URL for OAuth redirect
 scope: ['profile', 'email']               // Request access to user's profile and email
}, 
async (accessToken, refreshToken, profile, cb) => {
 try {
   // Extract user information from Google profile
   const { id, displayName, emails, photos } = profile;

   // Check if user already exists in our database
   let user = await User.findOne({ googleId: id });
   
   // If user doesn't exist, create a new user record
   if (!user) {
     user = new User({
       name: displayName,
       googleId: id,
       email: emails[0].value,
       avatar: {
         public_id: null,            // No custom avatar ID initially
         url: photos[0].value        // Use Google profile photo as avatar
       },
       number: '',                   // Empty phone number field
       description: '',              // Empty description field
       userType: 'default',          // Default user type
       regNumber: null,              // No registration number
       files: []                     // Empty files array
     });
     await user.save();
   }

   // Return the user object to Passport
   return cb(null, user);
   
 } catch (err) {
   // Handle any errors during authentication
   return cb(err, null);
 }
}
));

// Configure Passport session management
// Serialize user: Determine which data to store in the session
passport.serializeUser((user, done) => {
 done(null, user.id);  // Store only user ID in session
});

// Deserialize user: Retrieve user data from database based on session data
passport.deserializeUser(async (id, done) => {
 try {
   const user = await User.findById(id);
   done(null, user);  // Pass complete user object to request
 } catch (err) {
   done(err, null);   // Handle database errors
 }
});