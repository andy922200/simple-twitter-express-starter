const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController.js')
const adminController = require('../controllers/adminController.js')

module.exports = app => {
  app.get('/', (req, res) => {
    res.redirect('/tweets')
  })
  app.get('/tweets', tweetController.getTweets)
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  // 後台

  app.get('/admin', (req, res) => {
    res.redirect('/admin/tweets')
  })
  app.get('/admin/tweets', adminController.getTweets)
  app.delete('/admin/tweets/:id', adminController.deleteTweet)
  // app.get('/admin/users', adminController.getUsers)
}

