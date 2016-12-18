const mongodb = require('mongodb')

const url = 'mongodb://localhost/zhihu'
const connection = mongodb.MongoClient.connect(url)

function getCollection(name) {
  return connection.then(db => db.collection(name))
}

exports.user = getCollection('user')
exports.follow = getCollection('follow')
exports.topic = getCollection('topic')
exports.answer = getCollection('answer')
exports.question = getCollection('question')
