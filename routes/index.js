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

const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') {
      return next()
    }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    res.redirect('/tweets')
  })
  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweet)
  app.get('/tweets/:id/replies', authenticated, tweetController.getTweetReplies)
  app.post('/tweets/:id/replies', authenticated, tweetController.postReply)
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  // 後台

  app.get('/admin', (req, res) => {
    res.redirect('/admin/tweets')
  })
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.delete(
    '/admin/tweets/:id',
    authenticatedAdmin,
    adminController.deleteTweet
  )
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
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
  app.get('/users/:id/likes', authenticated, userController.getLikes)
  app.get('/users/:id/tweets', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.post(
    '/users/:id/edit',
    authenticated,
    upload.single('avatar'),
    userController.putUser
  )
  app.post('/tweets/:id/like', authenticated, userController.addLike)
  app.post('/tweets/:id/unlike', authenticated, userController.removeLike)
  app.post('/followships', authenticated, userController.addFollowing)

  app.delete(
    '/followships/:followingId',
    authenticated,
    userController.removeFollowing
  )
  app.get('/users/:id/followings', authenticated, userController.getFollowings)
  app.get('/users/:id/followers', authenticated, userController.getFollowers)
}
