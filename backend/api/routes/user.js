const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/user');
const userController = require('../../controllers/userController');
require('../../utils/auth'); // Import authentication setup

// Middleware to check if the user is authenticated
const isLoggedIn = (req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Is Authenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    return next(); // Proceed to the next middleware if authenticated
  }
  res.status(401).json({ error: 'Unauthorized' }); // Return an error if not authenticated
};

// Route to initiate Google authentication
router.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['email', 'profile'], // Request email and profile scope from Google
    prompt: 'select_account' // Prompt user to select an account
  })
);

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failure' // Redirect on authentication failure
  }),
  (req, res) => {
    // Redirect user to the profile page on successful authentication
    res.redirect(`${process.env.CLIENT_URL}/profile`);
  }
);

// Route to get the authenticated user's data
router.get('/me', isLoggedIn, (req, res) => {
  console.log('sending data : ', req.user);
  res.json(req.user);
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    // Destroy session after logout
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destruction error:', destroyErr);
        return res.status(500).json({ error: 'Session destruction failed' });
      }

      // Clear authentication cookie
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });

      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get a specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to update user details
router.put('/edit/:id', userController.updateUser);
// Route to delete a user
router.delete('/delete/:id', userController.deleteUser);
// Route to delete a file associated with a user
router.delete('/removefile/:userId/files/:fileId', userController.deleteFiles);
// Route to get basic user information
router.get('/basic/:id', userController.getUserBasicInfo);

module.exports = router; // Export the router for use in the application
