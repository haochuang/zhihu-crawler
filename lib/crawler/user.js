const api = require('../common/api')
const db = require('../common/db')
const redis = require('../common/redis')
const MQ = require('../common/mq')
const mq = new MQ({ routingKey: 'zh.user', prefetchCount: 1 })

async function getUser(url_token) {
  const redis_key = `zh:user:${url_token}`
  const cache = await redis.get(redis_key)

  if (cache) {
    return
  }

  const collection = await db.user

  try {
    const profile = await api.user(url_token).profile()
    profile._id = profile.id
    profile._updated = Date.now()

    await collection.insertOne(profile)
    await getFollowees(url_token)
    await redis.del('fail:' + redis_key)
    await redis.set(redis_key, Date.now())
  } catch (e) {
    await redis.set('fail:' + redis_key, Date.now())
  }
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
  setTimeout(function() {
    getUser(msg.content.url_token)
      .then(done)
      .catch(done)
  }, 5000)
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
