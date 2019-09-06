const constants = require('./constants')
module.exports = {
    platforms: [
        {
            name: constants.platform.JUEJIN,
            label: '掘金',
            editorType: constants.editorType.MARKDOWN,
            url: 'https://juejin.im',
            description: '掘金是一个帮助开发者成长的社区，是给开发者用的 Hacker News，给设计师用的 Designer News，和给产品经理用的 Medium。掘金的技术文章由稀土上聚集的技术大牛和极客共同编辑为你筛选出最优质的干货，其中包括：Android、iOS、前端、后端等方面的内容。用户每天都可以在这里找到技术世界的头条内容。与此同时，掘金内还有沸点、掘金翻译计划、线下活动、专栏文章等内容。即使你是 GitHub、StackOverflow、开源中国的用户，我们相信你也可以在这里有所收获。'
        },
        {
            name: constants.platform.SEGMENTFAULT,
            label: 'SegmentFault',
            editorType: constants.editorType.MARKDOWN,
            url: 'https://segmentfault.com',
            description: 'SegmentFault 思否 为开发者提供问答、学习与交流编程知识的平台，创造属于开发者的时代！'
        },
        {
            name: constants.platform.CSDN,
            label: 'CSDN',
            editorType: constants.editorType.RICH_TEXT,
            url: 'https://blog.csdn.net',
            description: 'CSDN博客-专业IT技术发表平台'
        },
        {
            name: constants.platform.JIANSHU,
            label: '简书',
            editorType: constants.editorType.MARKDOWN,
            url: 'https://jianshu.com',
            description: '简书是一个优质的创作社区，在这里，你可以任性地创作，一篇短文、一张照片、一首诗、一幅画……我们相信，每个人都是生活中的艺术家，有着无穷的创造力。'
        }
    ]
}
