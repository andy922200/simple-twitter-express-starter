// controllers/tweetController.js
const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({ include: [User], order: [['createdAt', 'DESC']] }).then(
      tweets => {
        const data = tweets.map(r => ({
          ...r.dataValues
        }))
        res.render('tweets', { tweets: data })
      }
    )
  },
  postTweet: (req, res) => {
    if (!req.body.newTweet) {
      req.flash('error_messages', '請記得填入訊息')
      return res.redirect('back')
    }
    if (req.body.length > 140) {
      req.flash('error_messages', '請勿填入超過140個字')
      return res.redirect('back')
    }
    return Tweet.create({
      description: req.body.newTweet,
      UserId: req.user.id
    }).then(tweet => {
      res.redirect(`/tweets`)
    })
  }
}
module.exports = tweetController
