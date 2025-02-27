const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/user');
const userController = require('../../controllers/userController');
require('../../utils/auth');

const isLoggedIn = (req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Is Authenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

router.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['email', 'profile'],
    prompt: 'select_account'
  })
);

router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failure'
  }),
  (req, res) => {

    res.redirect(`${process.env.CLIENT_URL}/profile`);
  }
);

router.get('/me', isLoggedIn, (req, res) => {
  console.log('sending data : ',req.user);
  res.json(req.user);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destruction error:', destroyErr);
        return res.status(500).json({ error: 'Session destruction failed' });
      }

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

router.get('/users', async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

router.put('/edit/:id', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);
router.delete('/removefile/:userId/files/:fileId', userController.deleteFiles);
router.get('/basic/:id', userController.getUserBasicInfo);
module.exports = router;