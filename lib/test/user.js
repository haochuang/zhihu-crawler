const MQ = require('../common/mq')

const mq = new MQ({ routingKey: 'user' })

mq.connect().then(() => {
  mq.consume((msg, done) => {
    const user = msg.content

    console.log(user)

    mq.send('answer', Object.assign({}, user, { score: Math.random() }))

    if (user.id >= 10) {
      done()
    } else {
      setTimeout(() => {
        mq.send('user', { id: user.id + 1 })
        done()
      }, 1000)
    }
  })
})
