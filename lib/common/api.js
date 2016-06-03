const fs = require('fs')
const path = require('path')
const api = require('zhihu-api')

var cookiePath = path.join(__dirname, '../../cookie')
api.cookie(fs.readFileSync(cookiePath))

module.exports = api
