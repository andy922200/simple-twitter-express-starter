// controllers/tweetController.js
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const Followship = db.Followship
const pageLimit = 15
const helpers = require('../_helpers')

const tweetController = {
  getTweets: (req, res) => {
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    Tweet.findAndCountAll({
      include: [User, Reply, { model: User, as: 'LikedUsers' }],
      offset: offset,
      limit: pageLimit,
      order: [['createdAt', 'DESC']]
    }).then(tweets => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(tweets.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      )
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      const data = tweets.rows.map(r => ({
        ...r.dataValues,
        isLiked: helpers.getUser(req).LikedTweets
          ? helpers
            .getUser(req)
            .LikedTweets.map(d => d.id)
            .includes(r.id)
          : helpers.getUser(req).LikedTweets,
        totalLikedUsers: r.dataValues.LikedUsers.length,
        replyCount: r.dataValues.Replies.length
      }))
      User.findAll({
        include: [{ model: User, as: 'Followers' }],
        order: [
          [{ model: User, as: 'Followers' }, Followship, 'createdAt', 'DESC']
        ]
      }).then(users => {
        const topFollowers = users
          .map(r => ({
            ...r.dataValues,
            introduction: r.dataValues.introduction
              ? r.dataValues.introduction.substring(0, 50)
              : '',
            isFollowed: helpers
              .getUser(req)
              .Followings.map(d => d.id)
              .includes(r.id),
            totalFollowers: r.dataValues.Followers.length
          }))
          .sort((a, b) => b.totalFollowers - a.totalFollowers)
          .slice(0, 10)
        res.render('tweets', {
          tweets: data,
          topFollowers: topFollowers,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },
  postTweet: (req, res) => {
    if (!req.body.description) {
      req.flash('error_messages', '請記得填入訊息')
      return res.redirect('back')
    } else if (req.body.description.length > 140) {
      req.flash('error_messages', '超過140字的已被忽略')
      return res.redirect('back')
    } else {
      Tweet.create({
        description: req.body.description,
        UserId: helpers.getUser(req).id
      }).then(tweet => {
        return res.redirect(`/tweets`)
      })
    }
  },
  getTweetReplies: (req, res) => {
    Tweet.findByPk(req.params.id, {
      include: [
        { model: User, include: [Tweet] },
        { model: User, as: 'LikedUsers' },
        { model: Reply, include: [User] }
      ],
      order: [[{ model: Reply }, 'createdAt', 'DESC']]
    }).then(result => {
      const tweet = result.dataValues
      const tweetUser = tweet.User.dataValues
      const totalTweets = result.User.Tweets.length
      const reply = result.Replies
      const isFollowed = helpers
        .getUser(req)
        .Followings.map(d => d.id)
        .includes(tweetUser.id)
      const replyCount = reply.length
      User.findByPk(tweetUser.id, {
        include: [
          { model: Tweet, as: 'LikedTweets' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, where: { description: tweet.description } }
        ]
      }).then(user => {
        const totalLiked = user.LikedTweets.length
        const totalFollowers = user.Followers.length
        const totalFollowings = user.Followings.length
        const isLiked = helpers.getUser(req).LikedTweets
          ? helpers
            .getUser(req)
            .LikedTweets.map(d => d.id)
            .includes(tweet.id)
          : helpers.getUser(req).LikedTweets
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
    if (!/^[^\s]+(\s+[^\s]+)*$/g.test(req.body.newReply)) {
      req.flash('error_messages', '請記得填入訊息')
      return res.redirect('back')
    }
    Tweet.findByPk(req.params.id)
      .then(
        Reply.create({
          UserId: helpers.getUser(req).id,
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
