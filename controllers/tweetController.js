// controllers/tweetController.js
const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({ include: [User] })
      .then(tweets => {
        const data = tweets.map(r => ({
          ...r.dataValues
        }))
        res.render('tweets', { tweets: data })
      })
  }
}

module.exports = tweetController