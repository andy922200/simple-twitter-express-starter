// controllers/tweetController.js
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({
      include: [User, Reply],
      order: [['createdAt', 'DESC']]
    }).then(tweets => {
      tweets = tweets.map(r => ({
        ...r.dataValues,
        replyCount: r.dataValues.Replies.length
      }))
      User.findAll({
        include: [{ model: User, as: 'Followers' }]
      }).then(users => {
        users = users.map(r => ({
          ...r.dataValues,
          introduction: r.dataValues.introduction.substring(0, 50),
          isFollowed: req.user.Followings.map(d => d.id).includes(r.id),
          totalFollowers: r.dataValues.Followers.length
        }))
        users = users.sort((a, b) => b.totalFollowers - a.totalFollowers)
        topFollowers = users.slice(0, 10)
        res.render('tweets', { tweets: tweets, topFollowers: topFollowers })
      })
    }
    )
  },
  postTweet: (req, res) => {
    if (!req.body.newTweet) {
      req.flash('error_messages', '請記得填入訊息')
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
      const reply = result.Replies
      const isFollowed = req.user.Followings.map(d => d.id).includes(tweetUser.id)
      return res.render('replies', { reply: reply, tweet: tweet, tweetUser: tweetUser, isFollowed: isFollowed })
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
