const MQ = require('../common/mq')

const mq = new MQ({ routingKey: 'answer' })

mq.connect().then(() => {
  mq.consume((msg, done) => {
    console.log(msg.content)
    done()
  })
})
