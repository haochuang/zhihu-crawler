const mongodb = require('mongodb')

const url = 'mongodb://localhost/zhihu'
const connection = mongodb.MongoClient.connect(url)

function collection(name) {
  return connection.then(db => db.collection(name))
}

exports.col = collection

exports.user = collection('user')
exports.follow = collection('follow')
exports.topic = collection('topic')
exports.answer = collection('answer')
exports.question = collection('question')
