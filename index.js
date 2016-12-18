const api = require('./lib/common/api')

api.user('zhihuadmin')
  .profile()
  .then(console.log)
  .catch(console.trace)
