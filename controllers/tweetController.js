// controllers/tweetController.js
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply

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
    if (!req.body.newTweet) {
      req.flash('error_messages', "請記得填入訊息")
      return res.redirect('back')
    }
    if (req.body.newTweet.length > 140) {
      req.flash('error_messages', "請勿填入超過140個字")
      return res.redirect('back')
    }
    return Tweet.create({
      description: req.body.newTweet,
      UserId: req.user.id
    }).then(tweet => {
      res.redirect(`/tweets`)
    })
  },
  getTweetReplies: (req, res) => {
    Tweet.findByPk(req.params.id, {
      include: [User, { model: Reply, include: [User] }]
    }).then(result => {
      const tweet = result.dataValues
      const tweetUser = tweet.User.dataValues
      const reply = result.Replies.map(r => ({
        ...r.dataValues
      }))
      return res.render('replies', { reply: reply, tweet: tweet, tweetUser: tweetUser })
    })
  },
  postReply: (req, res) => {
    if (!req.body.newReply) {
      req.flash('error_messages', "請記得填入訊息")
      return res.redirect('back')
    }
    if (req.body.newReply.length > 140) {
      req.flash('error_messages', "請勿填入超過140個字")
      return res.redirect('back')
    }
    Tweet.findByPk(req.params.id)
      .then(Reply.create({
        UserId: req.user.id,
        TweetId: req.params.id,
        comment: req.body.newReply
      }))
      .then(reply => {
        req.flash('success_messages', '回覆成功！')
        return res.redirect(`/tweets/${req.params.id}/replies`)
      })
  }
}
module.exports = tweetController
