const constants = require('./constants')
module.exports = {
  // 平台
  platforms: [
    {
      name: constants.platform.JUEJIN,
      label: '掘金',
      editorType: constants.editorType.MARKDOWN,
      url: 'https://juejin.im',
      description: '掘金是一个帮助开发者成长的社区，是给开发者用的 Hacker News，给设计师用的 Designer News，和给产品经理用的 Medium。掘金的技术文章由稀土上聚集的技术大牛和极客共同编辑为你筛选出最优质的干货，其中包括：Android、iOS、前端、后端等方面的内容。用户每天都可以在这里找到技术世界的头条内容。与此同时，掘金内还有沸点、掘金翻译计划、线下活动、专栏文章等内容。即使你是 GitHub、StackOverflow、开源中国的用户，我们相信你也可以在这里有所收获。',
      enableImport: false,
      enableLogin: true,
    },
    {
      name: constants.platform.SEGMENTFAULT,
      label: 'SegmentFault',
      editorType: constants.editorType.MARKDOWN,
      url: 'https://segmentfault.com',
      description: 'SegmentFault 思否 为开发者提供问答、学习与交流编程知识的平台，创造属于开发者的时代！',
      enableImport: false,
      enableLogin: true,
    },
    {
      name: constants.platform.CSDN,
      label: 'CSDN',
      editorType: constants.editorType.RICH_TEXT,
      url: 'https://blog.csdn.net',
      description: 'CSDN博客-专业IT技术发表平台',
      enableImport: false,
      enableLogin: false,
    },
    {
      name: constants.platform.JIANSHU,
      label: '简书',
      editorType: constants.editorType.MARKDOWN,
      url: 'https://jianshu.com',
      description: '简书是一个优质的创作社区，在这里，你可以任性地创作，一篇短文、一张照片、一首诗、一幅画……我们相信，每个人都是生活中的艺术家，有着无穷的创造力。',
      enableImport: false,
      enableLogin: false,
    },
    {
      name: constants.platform.ZHIHU,
      label: '知乎',
      editorType: constants.editorType.MARKDOWN,
      url: 'https://zhihu.com',
      description: '有问题，上知乎。知乎，可信赖的问答社区，以让每个人高效获得可信赖的解答为使命。知乎凭借认真、专业和友善的社区氛围，结构化、易获得的优质内容，基于问答的内容生产方式和独特的社区机制，吸引、聚集了各行各业中大量的亲历者、内行人、领域专家、领域爱好者，将高质量的内容透过人的节点来成规模地生产和分享。用户通过问答等交流方式建立信任和连接，打造和提升个人影响力，并发现、获得新机会。',
      enableImport: false,
      enableLogin: false,
    },
    {
      name: constants.platform.OSCHINA,
      label: '开源中国',
      editorType: constants.editorType.RICH_TEXT,
      url: 'https://oschina.net',
      description: 'OSCHINA.NET 是目前领先的中文开源技术社区。我们传播开源的理念，推广开源项目，为 IT 开发者提供了一个发现、使用、并交流开源技术的平台',
      enableImport: false,
      enableLogin: false,
    },
    {
      name: constants.platform.TOUTIAO,
      label: '今日头条',
      editorType: constants.editorType.MARKDOWN,
      url: 'https://toutiao.com',
      description: '《今日头条》(www.toutiao.com)是一款基于数据挖掘的推荐引擎产品，它为用户推荐有价值的、个性化的信息，提供连接人与信息的新型服务，是国内移动互联网领域成长最快的产品服务之一。',
      enableImport: false,
      enableLogin: false,
    },
    {
      name: constants.platform.CNBLOGS,
      label: '博客园',
      editorType: constants.editorType.RICH_TEXT,
      url: 'https://cnblogs.com',
      description: '博客园是一个面向开发者的知识分享社区。自创建以来，博客园一直致力并专注于为开发者打造一个纯净的技术交流社区，推动并帮助开发者通过互联网分享知识，从而让更多开发者从中受益。博客园的使命是帮助开发者用代码改变世界。',
      enableImport: false,
      enableLogin: false,
    },
    {
      name: constants.platform.V2EX,
      label: 'V2ex',
      editorType: constants.editorType.MARKDOWN,
      url: 'https://v2ex.com',
      description: 'v2ex，是一个汇集各类奇妙好玩的话题和流行动向的网站。V2EX 提供了特别有用的小工具 [ ZEN ]，帮助你掌握自己的时间。V2EX 中充满了各种各样精心雕琢的细节。',
      enableImport: false,
      enableLogin: false,
    }
  ],

  // 环境变量
  environments: [
    {
      _id: constants.environment.UPDATE_STATS_CRON,
      label: '更新文章统计数据频率',
      value: '0 0/30 * * * *'
    },
    {
      _id: constants.environment.ENABLE_CHROME_DEBUG,
      label: 'Chrome浏览器调试模式',
      value: 'N'
    }
  ]
}
