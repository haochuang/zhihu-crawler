const api = require('../common/api')
const db = require('../common/db')
const redis = require('../common/redis')
const MQ = require('../common/mq')
const mq = new MQ({ routingKey: 'zh.user', prefetchCount: 5 })

async function getUser(url_token) {
  const redis_key = `zh:user:${url_token}`
  const cache = await redis.get(redis_key)

  if (cache) {
    return
  }

  const collection = await db.user
  const profile = await api.user(url_token).profile()
  profile._id = profile.id
  profile._updated = Date.now()

  await collection.insertOne(profile)
  await getFollowees(url_token)
  await redis.set(redis_key, Date.now())
}

function getFollowees(url_token) {
  const user = api.user(url_token)
  let offset = 0

  function next() {
    return user.followees(offset).then(data => {
      if (!data.length) {
        return
      }

      data.forEach(d => {
        redis.get(`zh:user:${d.url_token}`).then(cache => {
          if (!cache) {
            mq.send('zh.user', { url_token: d.url_token })
          }
        })
      })

      offset += data.length
      return next()
    })
  }

  return next()
}

function consumeFn(msg, done) {
  getUser(msg.content.url_token)
    .then(done)
    .catch(done)
}

mq.connect().then(() => {
  const seed = 'zhouyuan'

  redis.get(`zh:user:${seed}`).then(cache => {
    if (cache) {
      mq.consume(consumeFn)
    } else {
      getUser(seed).then(() => {
        mq.consume(consumeFn)
      })
    }
  })
})
