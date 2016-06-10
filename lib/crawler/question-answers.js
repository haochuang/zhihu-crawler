const debug = require('debug')('question-answers')
const api = require('../common/api')
const db = require('../common/db')

var skip = 0

exports.start = start

function start() {
  debug('start...')
  nextQuestion()
    .then(nextQuestion)
    .then(nextQuestion)
    .then(nextQuestion)
    .then(nextQuestion)
    .then(nextQuestion)
    .then(nextQuestion)
    .then(nextQuestion)
    .catch(nextQuestion)
}

function nextQuestion() {
  return db.question.then(question => {
    question.find({})
      .skip(skip++)
      .limit(1)
      .toArray()
      .then(arr => {
        if (!arr.length) {
          return debug('done!')
        }
        answersOfQuestion(arr[0])
      })
  })
}

function answersOfQuestion(question) {
  var quesStr = question.id + '-' + question.title
  var page = 1
  question = api.question(question)

  next()

  function next() {
    debug('skip: %d, page: %d, question: %s', skip, page, quesStr)

    question.answersByPage(page)
      .then(data => {
        if (data.length) {
          page++
          saveAnswers(data)
          next()
        } else {
          nextQuestion()
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
    })
  })
}
