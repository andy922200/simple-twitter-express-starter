const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController.js')
const adminController = require('../controllers/adminController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

// authenticate the identity first
const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    res.redirect('/tweets')
  })
  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweet)
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  // 後台

  app.get('/admin', (req, res) => {
    res.redirect('/admin/tweets')
  })
  app.get('/admin/tweets', adminController.getTweets)
  app.delete('/admin/tweets/:id', adminController.deleteTweet)
  // app.get('/admin/users', adminController.getUsers)
  app.get('/signin', userController.signInPage)
  app.post(
    '/signin',
    passport.authenticate('local', {
      failureRedirect: '/signin',
      failureFlash: true
    }),
    userController.signIn
  )
  app.get('/logout', userController.logout)
  app.get('/users/:id/tweets', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.post(
    '/users/:id/edit',
    authenticated,
    upload.single('avatar'),
    userController.putUser
  )
}
