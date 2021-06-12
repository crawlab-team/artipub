import * as Result from '../utils/result'
import { Router } from 'express'
import { Cookie } from '@/models';
const router = Router();

const addCookies = async (req, res) => {
    const cookies = req.body
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i]
      if (c.domain == 'aliyun' && c.domain != '.aliyun.com' && c.domain != 'developer.aliyun.com') {
        continue
      }
      let cookie = await Cookie.findOne({
        user: req.user._id,
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
        cookie = new Cookie({ ...c, user: req.user._id })
      }
      await cookie.save()
    }
   Result.success(res);
  };

router.post('/', addCookies)

export = { router, basePath: '/cookies', };
