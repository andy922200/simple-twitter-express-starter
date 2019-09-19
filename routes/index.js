const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController.js')

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    res.redirect('/tweets')
  })
  app.get('/tweets', tweetController.getTweets)
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
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
}
