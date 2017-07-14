const MQ = require('../common/mq')

const mq = new MQ()

mq.connect().then(() => {
  mq.send('user', { id: 1 })
})
