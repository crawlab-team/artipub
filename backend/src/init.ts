import {Cookie, Platform} from './models'
import data from './data'

// 数据库初始化
const init = async () => {
  // 初始化平台数据
  for (let i = 0; i < data.platforms.length; i++) {
    const platform = data.platforms[i]
    let platformDb = await Platform.findOne({ name: platform.name })
    if (!platformDb) {
      platformDb = new Platform(platform)
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

  // 删除juejin.im域的cookie
  await Cookie.deleteMany({ domain: { $regex: '.juejin.im' } });
}

export default init
