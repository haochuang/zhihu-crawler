const debug = require('debug')('top-answers')
const api = require('../common/api')
const db = require('../common/db')

var skip = 0

exports.start = start

function start() {
  debug('start...')
  nextTopic()
}

function nextTopic() {
  db.topic.then(topic => {
    topic.find({})
      .sort({
        followers: -1
      })
      .skip(skip++)
      .limit(1)
      .toArray()
      .then(arr => {
        if (!arr.length) {
          return debug('done!')
        }
        hotAnswersOfTopic(arr[0])
      })
  })
}

function hotAnswersOfTopic(topic) {
  var topicStr = topic.id + '-' + topic.name
  var page = 1
  topic = api.topic(topic)

  next()

  function next() {
    debug('top answers of %s page %d', topicStr, page)

    topic.topAnswers(page)
      .then(data => {
        if (data.length) {
          page++
          saveAnswers(data)
          next()
        } else {
          nextTopic()
        }
      })
      .catch(err => {
        console.trace(err)
        next()
      })
  }
}

function saveAnswers(data) {
  if (!data || !data.length) {
    return
  }

  db.answer.then(answer => {
    data.forEach(d => {
      d._id = d.id
      answer.save(d)
        // .then(item => debug('save answer %d', d.id))
        // .catch(err => debug('save answer %d error', d.id))
    })
  })
}
