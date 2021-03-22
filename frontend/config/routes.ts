export default [
  {
    path: '/',
    redirect: '/platforms',
  },
  {
    path: '/platforms',
    name: 'platforms',
    icon: 'cloud',
    component: './PlatformList/PlatformList',
  },
  {
    path: '/articles',
    name: 'articles',
    icon: 'read',
    component: './ArticleList/ArticleList',
  },
  {
    path: '/articles/edit/:id',
    name: 'article-edit',
    icon: 'read',
    hideInMenu: true,
    // 不展示顶栏
    headerRender: false,
    // 不展示页脚
    footerRender: false,
    // 不展示菜单
    menuRender: false,
    // 不展示菜单顶栏
    menuHeaderRender: false,
    component: './ArticleEdit/ArticleEdit',
  },
  {
    path: '/articles/new',
    name: 'article-new',
    icon: 'read',
    hideInMenu: true,
    // 不展示顶栏
    headerRender: false,
    // 不展示页脚
    footerRender: false,
    // 不展示菜单
    menuRender: false,
    // 不展示菜单顶栏
    menuHeaderRender: false,
    component: './ArticleEdit/ArticleEdit',
  },
  {
    path: '/helper',
    name: 'helper',
    icon: 'key',
    component: './Helper/Helper',
  },
  {
    path: '/environments',
    name: 'environments',
    icon: 'setting',
    component: './Environment/EnvironmentList',
  },
  {
    component: './404',
  },
];
