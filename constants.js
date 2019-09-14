module.exports = {
  platform: {
    JUEJIN: 'juejin',
    SEGMENTFAULT: 'segmentfault',
    JIANSHU: 'jianshu',
    CSDN: 'csdn',
    ZHIHU: 'zhihu',
    OSCHINA: 'oschina',
  },
  status: {
    NOT_STARTED: 'not-started',
    PROCESSING: 'processing',
    FINISHED: 'finished',
    ERROR: 'error'
  },
  authType: {
    LOGIN: 'login',
    COOKIES: 'cookie'
  },
  editorType: {
    MARKDOWN: 'markdown',
    RICH_TEXT: 'rich-text'
  },
  environment: {
    updateStatsCron: 'update_stats_cron',
  },
  cookieStatus: {
    NO_COOKIE: 'no_cookie',
    EXPIRED: 'expired',
    EXISTS: 'exists',
  },
}
