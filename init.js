const models = require('./models')
const data = require('./data')

// 数据库初始化
const init = async () => {
  for (let i = 0; i < data.platforms.length; i++) {
    const platform = data.platforms[i]
    let platformDb = await models.Platform.findOne({ name: platform.name })
    if (!platformDb) {
      platformDb = new models.Platform(platform)
      await platformDb.save()
    } else {
      for (let key in platform) {
        if (platform.hasOwnProperty(key)) {
          if (platform[key]) {
            platformDb[key] = platform[key]
          }
        }
      }
      await platformDb.save()
    }
  }
}

module.exports = init
