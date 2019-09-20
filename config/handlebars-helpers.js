const moment = require('moment')
module.exports = {
  ifCond: function(a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  moment: function(time) {
    return moment(time).format('YYYY-MM-DD, HH:mm')
  }
}
