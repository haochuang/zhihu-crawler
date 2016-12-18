const api = require('../common/api')
const db = require('../common/db')

function crawlSeed(url_token) {
  return api.user(url_token)
    .profile()
}


function saveUsers(users) {
  var ids = []
  users.forEach(user => {
    user._id = user.id
    ids.push(user.id)
  })

  var opts = {
    _id: {
      $in: ids
    }
  }

  return db.user.then(col => {
    return col.deleteMany(opts)
      .then(() => col.insertMany(users))
  })
}
