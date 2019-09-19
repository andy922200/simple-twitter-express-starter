const db = require('../models')
const User = db.User
const Tweet = db.Tweet

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
}
module.exports = adminController