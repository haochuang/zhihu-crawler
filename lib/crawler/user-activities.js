const debug = require('debug')('user-activities')
const api = require('../common/api')
const db = require('../common/db')

var user
var startTime
var collection

exports.start = start

function start(uname) {
  user = api.user(uname)
  collection = db.col(uname + '_activity')

  next()
}

function next() {
  debug('user: %s, start time: %d', user._user.uname, startTime)

  user.activities(startTime)
    .then(data => {
      if (!data.length) {
        return debug('done!')
      }

      startTime = data[data.length - 1].time / 1000
      saveActivities(data)
      next()
    })
    .catch(err => {
      console.trace(err)
      next()
    })
}

function saveActivities(data) {
  if (!data || !data.length) {
    return
  }

  collection.then(col => {
    col.insertMany(data)
  })
}
