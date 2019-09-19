const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController.js')

module.exports = app => {
  app.get('/', (req, res) => {
    res.redirect('/tweets')
  })
  app.get('/tweets', tweetController.getTweets)
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
}