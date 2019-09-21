const models = require('../models')

module.exports = {
  addCookies: async (req, res) => {
    const cookies = req.body
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i]
      let cookie = await models.Cookie.findOne({
        domain: c.domain,
        name: c.name
      })
      if (cookie) {
        // 已存在该cookie
        for (let k in c) {
          if (c.hasOwnProperty(k)) {
            cookie[k] = c[k]
          }
        }
      } else {
        // 不存在该cookie，新增
        cookie = new models.Cookie({ ...c })
      }
      await cookie.save()
    }
    res.json({
      status: 'ok'
    })
  },
}
