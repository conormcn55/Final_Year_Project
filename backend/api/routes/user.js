const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/user');
require('../../utils/auth')
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }

router.get('/', (req, res) => {
    res.send('<a href="/api/user/auth/google">Authenticate with Google</a>');
  });

  router.get('/auth/google',
    passport.authenticate('google',{scope: ['email','profile']}));

  router.get('/google/callback',
    passport.authenticate('google', {
          failureRedirect: '/auth/google/failure'
        }),
        (req, res) => {
          res.redirect(`http://localhost:3000/profile?userId=${req.user.id}`);
  
        }
      );
  

      router.get('/logout', (req, res) => {
        req.logout((err) => {
          if (err) {
            // Handle the error, if necessary
            console.error(err);
            return res.status(500).send('Logout failed');
          }
          
          // Destroy the session after logout
          req.session.destroy((destroyErr) => {
            if (destroyErr) {
              console.error(destroyErr);
              return res.status(500).send('Could not destroy session');
            }
            
            res.redirect('http://localhost:3000/');
          });
        });
      });
      
  
  router.get('/auth/google/failure', (req, res) => {
    res.send('Failed to authenticate..');
  });
  router.get('/users', async (req, res) => {
    try {
        const users = await User.find(); 
        res.json(users); 
    } catch (err) {
        console.error(err); 
        res.status(500).send('Internal Server Error'); 
    }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).send('User not found'); 
    }
    res.json(user);
  } catch (err) {
    console.error(err); 
    res.status(500).send('Internal Server Error'); 
  }
});
module.exports = router;