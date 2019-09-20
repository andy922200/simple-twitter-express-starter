const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Followship = db.Followship
const Like = db.Like

const adminController = {
  getTweets: (req, res) => {
    Tweet.findAll({ include: [User] })
      .then(tweets => {
        const data = tweets.map(r => ({
          ...r.dataValues,
          description: r.dataValues.description ? r.dataValues.description.substring(0, 50) : r.dataValues.description
        }))
        res.render('admin/tweets', { tweets: data })
      })
  },
  deleteTweet: (req, res) => {
    return Tweet.findByPk(req.params.id)
      .then((tweet) => {
        tweet.destroy()
          .then((tweet) => {
            req.flash('success_messages', '成功刪除Tweet')
            return res.redirect('/admin/tweets')
          })
      })
  },
  getUsers: (req, res) => {
    return User.findAll({ include: [{ model: Tweet, include: [{ model: User, as: 'LikedUsers' }] }, { model: User, as: 'Followers' }, { model: User, as: 'Followings' }] })
      .then((users) => {
        const data = users.map(user => {
          if (user.dataValues.Tweets.length > 0) {
            return {
              ...user.dataValues,
              // 計算tweet被liked的總數
              tweetBeLiked: user.dataValues.Tweets.map(t => t.LikedUsers.length).reduce((a, b) => a + b)
            }
          }
          else {
            return {
              ...user.dataValues,
              // 計算tweet被liked的總數
              tweetBeLiked: 0
            }
          }
        })
        data.sort((a, b) => b.Tweets.length - a.Tweets.length)
        return res.render('admin/users', { users: data })
      })
  },
}
module.exports = adminController