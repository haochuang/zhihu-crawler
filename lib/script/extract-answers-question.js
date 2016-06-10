const debug = require('debug')('extract-answers-question')
const db = require('../common/db')

db.answer.then(answer => {
  var cursor = answer.find({})
  var index = 0

  db.question.then(question => {
    next()

    function next() {
      cursor.hasNext().then(hasNext => {
        if (!hasNext) {
          return
        }

        cursor.next().then(doc => {
          var ques = doc.question
          ques._id = ques.id

          debug('%d %d %s', index++, ques.id, ques.title)
          question.save(ques)
          next()
        })
      })
    }
  })
})
