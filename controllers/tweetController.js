// controllers/tweetController.js
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({
      include: [User, Reply, { model: User, as: 'LikedUsers' }],
      order: [['createdAt', 'DESC']]
    }).then(tweets => {
      const data = tweets.map(r => ({
        ...r.dataValues,
        isLiked: req.user.LikedTweets.map(d => d.id).includes(r.id),
        totalLikedUsers: r.dataValues.LikedUsers.length,
        replyCount: r.dataValues.Replies.length
      }))
      User.findAll({
        include: [{ model: User, as: 'Followers' }]
      }).then(users => {
        const topFollowers = users
          .map(r => ({
            ...r.dataValues,
            introduction: r.dataValues.introduction.substring(0, 50),
            isFollowed: req.user.Followings.map(d => d.id).includes(r.id),
            totalFollowers: r.dataValues.Followers.length
          }))
          .sort((a, b) => b.totalFollowers - a.totalFollowers)
          .slice(0, 10)
        res.render('tweets', { tweets: data, topFollowers: topFollowers })
      })
    })
  },
  postTweet: (req, res) => {
    if (!req.body.newTweet) {
      req.flash('error_messages', '請記得填入訊息')
      return res.redirect('back')
    }
    if (req.body.newTweet.length > 140) {
      req.flash('error_messages', '請勿填入超過140個字')
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
      include: [{ model: User, include: [Tweet] }, { model: User, as: 'LikedUsers' }, { model: Reply, include: [User] }],
      order: [[{ model: Reply }, 'createdAt', 'DESC']]
    }).then(result => {
      console.log(result)
      const tweet = result.dataValues
      const tweetUser = tweet.User.dataValues
      const totalTweets = result.User.Tweets.length
      const reply = result.Replies
      const isFollowed = req.user.Followings.map(d => d.id).includes(
        tweetUser.id
      )
      const replyCount = reply.length
      User.findByPk(tweetUser.id, {
        include: [
          { model: Tweet, as: 'LikedTweets' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, where: { 'description': tweet.description } }
        ]
      }).then(user => {
        const totalLiked = user.LikedTweets.length
        const totalFollowers = user.Followers.length
        const totalFollowings = user.Followings.length
        const isLiked = req.user.LikedTweets.map(d => d.id).includes(result.id)
        const totalLikedUsers = result.LikedUsers.length
        return res.render('replies', {
          reply: reply,
          tweet: tweet,
          tweetUser: tweetUser,
          isFollowed: isFollowed,
          replyCount: replyCount,
          totalTweets: totalTweets,
          totalLiked: totalLiked,
          totalFollowers: totalFollowers,
          totalFollowings: totalFollowings,
          isLiked: isLiked,
          totalLikedUsers: totalLikedUsers
        })
      })
    })
  },
  postReply: (req, res) => {
    if (!req.body.newReply) {
      req.flash('error_messages', '請記得填入訊息')
      return res.redirect('back')
    }
    if (req.body.newReply.length > 140) {
      req.flash('error_messages', '請勿填入超過140個字')
      return res.redirect('back')
    }
    Tweet.findByPk(req.params.id)
      .then(
        Reply.create({
          UserId: req.user.id,
          TweetId: req.params.id,
          comment: req.body.newReply
        })
      )
      .then(reply => {
        req.flash('success_messages', '回覆成功！')
        return res.redirect(`/tweets/${req.params.id}/replies`)
      })
  }
}
module.exports = tweetController
