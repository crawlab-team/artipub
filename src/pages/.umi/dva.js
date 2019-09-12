import dva from 'dva'
import { Component } from 'react'
import createLoading from 'dva-loading'
import history from '@tmp/history'

let app = null

export function _onCreate() {
  const plugins = require('umi/_runtimePlugin')
  const runtimeDva = plugins.mergeConfig('dva')
  app = dva({
    history,

    ...(runtimeDva.config || {}),
    ...(window.g_useSSR ? { initialState: window.g_initialData } : {}),
  })

  app.use(createLoading());
  (runtimeDva.plugins || []).forEach(plugin => {
    app.use(plugin)
  })

  app.model({ namespace: 'article', ...(require('/Users/yeqing/projects/artipub/src/models/article.ts').default) })
  app.model({ namespace: 'global', ...(require('/Users/yeqing/projects/artipub/src/models/global.ts').default) })
  app.model({ namespace: 'login', ...(require('/Users/yeqing/projects/artipub/src/models/login.ts').default) })
  app.model({ namespace: 'platform', ...(require('/Users/yeqing/projects/artipub/src/models/platform.ts').default) })
  app.model({ namespace: 'setting', ...(require('/Users/yeqing/projects/artipub/src/models/setting.ts').default) })
  app.model({ namespace: 'task', ...(require('/Users/yeqing/projects/artipub/src/models/task.ts').default) })
  app.model({ namespace: 'user', ...(require('/Users/yeqing/projects/artipub/src/models/user.ts').default) })
  return app
}

export function getApp() {
  return app
}

export class _DvaContainer extends Component {
  render() {
    const app = getApp()
    app.router(() => this.props.children)
    return app.start()()
  }
}
