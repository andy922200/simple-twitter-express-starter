const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            )
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          include: [{ model: User, as: 'LikedUsers' }, { model: Reply }]
        },
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ],
      order: [[{ model: Tweet }, 'createdAt', 'DESC']]
    }).then(user => {
      user.isFollowed = user.Followers.map(r => r.id).includes(req.user.id)
      const totalTweets = user.Tweets.length
      const totalLiked = user.LikedTweets.length
      const totalFollowers = user.Followers.length
      const totalFollowings = user.Followings.length
      const data = user.Tweets.map(tweet => ({
        ...tweet.dataValues,
        isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id),
        totalLikedUsers: tweet.dataValues.LikedUsers.length,
        replyCount: tweet.dataValues.Replies.length
      }))
      return res.render('profile', {
        profile: user,
        tweets: data,
        totalLiked,
        totalFollowers,
        totalFollowings,
        totalTweets
      })
    })
  },
  editUser: (req, res) => {
    if (Number(req.params.id) !== req.user.id) {
      req.flash('error_messages', '您無權編輯他人檔案')
      return res.redirect(`/users/${req.params.id}/tweets`)
    } else {
      return User.findByPk(req.params.id).then(user => {
        return res.render('edit')
      })
    }
  },
  putUser: (req, res) => {
    if (Number(req.params.id) !== Number(req.user.id)) {
      req.flash('error_messages', '您無權編輯他人檔案')
      return res.redirect(`/users/${req.params.id}/tweets`)
    }
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then(user => {
          user
            .update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : user.avatar
            })
            .then(user => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${req.params.id}/tweets`)
            })
        })
      })
    } else
      return User.findByPk(req.params.id).then(user => {
        user
          .update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: user.avatar
          })
          .then(user => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect(`/users/${req.params.id}/tweets`)
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    }).then(tweet => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: { UserId: req.user.id, TweetId: req.params.id }
    }).then(like => {
      like.destroy().then(tweet => {
        return res.redirect('back')
      })
    })
  },

  addFollowing: (req, res) => {
    if (req.user.id === Number(req.body.id)) {
      req.flash('error_messages', '無法追蹤自己')
      return res.redirect('back')
    } else {
      return Followship.create({
        followerId: req.user.id,
        followingId: req.body.id
      }).then(followship => {
        return res.redirect('back')
      })
    }
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.followingId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        return res.redirect('back')
      })
    })
  },
  getLikes: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          include: [{ model: User, as: 'LikedUsers' }]
        },
        {
          model: Tweet,
          as: 'LikedTweets',
          include: [User, { model: User, as: 'LikedUsers' }, { model: Reply }]
        },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ],
      order: [[{ model: Tweet, as: 'LikedTweets' }, Like, 'createdAt', 'DESC']]
    }).then(user => {
      user.isFollowed = user.Followers.map(r => r.id).includes(req.user.id)
      const totalTweets = user.Tweets.length
      const totalLiked = user.LikedTweets.length
      const totalFollowers = user.Followers.length
      const totalFollowings = user.Followings.length
      const likedTweets = user.LikedTweets.map(tweet => ({
        ...tweet.dataValues,
        isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id),
        totalLikedUsers: tweet.dataValues.LikedUsers.length,
        replyCount: tweet.dataValues.Replies.length
      }))
      return res.render('likes', {
        profile: user,
        totalLiked,
        totalFollowers,
        totalFollowings,
        totalTweets,
        likedTweets
      })
    })
  },
  getFollowings: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followings' },
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followers' },
        Tweet
      ],
      order: [[{ model: User, as: 'Followings' }, 'createdAt', 'DESC']]
    }).then(user => {
      const totalTweets = user.Tweets.length
      const totalLiked = user.LikedTweets.length
      const totalFollowers = user.Followers.length
      const totalFollowings = user.Followings.length
      const userFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      user.Followings = user.Followings.map(r => ({
        ...r.dataValues,
        introduction: r.dataValues.introduction
          ? r.dataValues.introduction.substring(0, 50)
          : r.dataValues.introduction,
        isFollowed: req.user.Followings.map(d => d.id).includes(r.dataValues.id)
      }))
      return res.render('followings', {
        profile: user,
        userFollowed,
        totalLiked,
        totalFollowers,
        totalFollowings,
        totalTweets
      })
    })
  },

  getFollowers: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followers' },
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followings' },
        Tweet
      ],
      order: [[{ model: User, as: 'Followers' }, 'createdAt', 'DESC']]
    }).then(user => {
      const totalTweets = user.Tweets.length
      const totalLiked = user.LikedTweets.length
      const totalFollowers = user.Followers.length
      const totalFollowings = user.Followings.length
      const userFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      user.Followers = user.Followers.map(r => ({
        ...r.dataValues,
        introduction: r.dataValues.introduction
          ? r.dataValues.introduction.substring(0, 50)
          : r.dataValues.introduction,
        isFollowed: req.user.Followings.map(r => r.id).includes(r.dataValues.id)
      }))
      return res.render('followers', {
        profile: user,
        userFollowed,
        totalLiked,
        totalFollowers,
        totalFollowings,
        totalTweets
      })
    })
  }
}

module.exports = userController
