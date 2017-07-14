const amqp = require('amqplib')

const defualtOpts = {
  amqpUrl: 'amqp://localhost',
  prefetchCount: 1,
  routingKey: ''
}

class MQ {
  constructor(opts) {
    this.options = Object.assign({}, defualtOpts, opts)
    this.connection = null
    this.channel = null
    this._connected = false
  }

  async connect() {
    if (this._connected) {
      return
    }

    const connection = await amqp.connect(this.options.amqpUrl)
    const channel = await connection.createChannel()
    this.connection = connection
    this.channel = channel
  }

  async send(routingKey, content) {
    if (typeof content === 'object') {
      content = JSON.stringify(content)
    } else {
      content = '' + content
    }

    const channel = this.channel
    channel.assertQueue(routingKey, { durable: true })
    await channel.sendToQueue(routingKey, Buffer.from(content), { persistent: true })
  }

  async consume(fn) {
    const channel = this.channel
    const { routingKey, prefetchCount } = this.options

    function callback(msg) {
      msg.content = msg.content.toString()
      try {
        msg.content = JSON.parse(msg.content)
      } catch (err) {
        // ignore
      }

      function done() {
        channel.ack(msg)
      }

      fn(msg, done)
    }

    channel.assertQueue(routingKey, { durable: true })
    channel.prefetch(prefetchCount)
    channel.consume(routingKey, callback, { noAck: false })
  }
}

module.exports = MQ
