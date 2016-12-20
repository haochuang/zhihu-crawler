const api = require('../common/api')
const db = require('../common/db')

exports.start = seed

/**
 * We will use `_crawltime` to make sure all followees have
 * been saved.
 */
function seed(url_token) {
  var query = {
    urlToken: url_token
  }

  db.user
    .then(col => col.findOne(query))
    .then(user => {
      if (!user || !user._crawltime) {
        crawlFollowees(url_token)
      } else {
        nextSeed()
      }
    })
}

/**
 * Use next user as a seed, crawl its all followees.
 */
function nextSeed() {
  var query = {
    _crawltime: {
      $exists: false
    }
  }

  db.user
    .then(col => col.findOne(query))
    .then(user => {
      if (!user) {
        console.log('ALL DONE!')
      } else {
        crawlFollowees(user.url_token)
      }
    })
}

/**
 * Crawl followees.
 */
function crawlFollowees(url_token) {
  var user = api.user(url_token)
  var offset = 0

  next()

  function next() {
    user.followees(offset)
      .then(data => {
        if (!data.length) {
          user.profile()
            .then(profile => {
              profile._crawltime = Date.now()
              saveUsers([profile]).then(nextSeed)
            })
        } else {
          offset += data.length
          saveUsers(data).then(next)
        }
      })
      .catch(nextSeed)
  }
}

/**
 * Save users to database.
 */
function saveUsers(users) {
  return db.user
    .then(col => {
      var bulk = col.initializeUnorderedBulkOp()

      users.forEach(user => {
        user._id = user.id
        bulk.find({
            _id: user._id
          })
          .upsert()
          .update({
            $set: user
          })
      })

      bulk.execute()
    })
}
