const mongodb = require('mongodb')

const url = 'mongodb://localhost/zhihu'
const connection = mongodb.MongoClient.connect(url)

function collection(name) {
  return connection.then(db => db.collection(name))
}

var collections = ['user', 'follow', 'topic', 'answer', 'question']

collections.forEach(name => {
  exports[name] = collection(name)
})
