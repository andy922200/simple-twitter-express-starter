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
  },
  postTweet: (req, res) => {
    return Tweet.create({
      description: req.body.newTweet,
      UserId: req.user.id
    }).then(tweet => {
      res.redirect(`/tweets`)
    })
  }
}
module.exports = tweetController
