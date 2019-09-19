const models = require('./models')
const data = require('./data')

// 数据库初始化
const init = async () => {
  // 初始化平台数据
  for (let i = 0; i < data.platforms.length; i++) {
    const platform = data.platforms[i]
    let platformDb = await models.Platform.findOne({ name: platform.name })
    if (!platformDb) {
      platformDb = new models.Platform(platform)
      await platformDb.save()
    } else {
      for (let key in platform) {
        if (platform.hasOwnProperty(key)) {
          if (platform[key] !== undefined) {
            platformDb[key] = platform[key]
          }
        }
      }
      await platformDb.save()
    }
  }

  // 初始化环境变量数据
  for (let i = 0; i < data.environments.length; i++) {
    const environment = data.environments[i]
    let environmentDb = await models.Environment.findOne({ _id: environment._id })
    if (!environmentDb) {
      environmentDb = new models.Environment(environment)
      await environmentDb.save()
    } else {
      // do nothing
      // for (let key in environment) {
      //   if (environment.hasOwnProperty(key)) {
      //     if (environment[key]) {
      //       environmentDb[key] = environment[key]
      //     }
      //   }
      // }
      // await environmentDb.save()
    }
  }
}

module.exports = init
