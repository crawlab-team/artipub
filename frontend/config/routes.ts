import type { IRoute } from "umi";

export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/user/login',
            name: 'login',
            component: './User/login'
          }
        ]
      },
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/articles/edit/:id',
            name: 'article-edit',
            authority: ['admin', 'user'],
            icon: 'read',
            hideInMenu: true,
            component: './ArticleEdit/ArticleEdit',
          },
          {
            path: '/articles/new',
            name: 'article-new',
            authority: ['admin', 'user'],
            icon: 'read',
            hideInMenu: true,
            component: './ArticleEdit/ArticleEdit',
          },
          {
            path: '/paste',
            name: 'paste',
            authority: ['admin', 'user'],
            icon: 'read',
            hideInMenu: true,
            component: './Paste/Paste',
          },
          {
            path: '/demo',
            name: 'demo',
            authority: ['admin', 'user'],
            icon: 'read',
            hideInMenu: true,
            component: './Demo/Demo',
          },
          {
            path: '/',
            component: '../layouts/BasicLayout',
            Routes: ['src/pages/Authorized'],
            authority: ['admin', 'user'],
            routes: [
              // {
              //   path: '/',
              //   name: 'welcome',
              //   icon: 'smile',
              //   component: './Welcome',
              // },
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
              // {
              //   path: '/templates',
              //   name: 'templates',
              //   icon: 'read',
              //   component: './TemplateList/TemplateList',
              // },
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
            ],
          }
        ]
      },
    ]
  },
  {
    component: './404',
  },
] as IRoute[];
