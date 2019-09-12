import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@tmp/history';
import RendererWrapper0 from '/Users/yeqing/projects/artipub/src/pages/.umi/LocaleWrapper.jsx';
import _dvaDynamic from 'dva/dynamic';

const Router = require('dva/router').routerRedux.ConnectedRouter;

const routes = [
  {
    path: '/articles/edit/:id',
    name: 'article-edit',
    authority: ['admin', 'user'],
    icon: 'read',
    hideInMenu: true,
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () =>
            import(/* webpackChunkName: "p__ArticleEdit__ArticleEdit" */ '../ArticleEdit/ArticleEdit'),
          LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
            .default,
        })
      : require('../ArticleEdit/ArticleEdit').default,
    exact: true,
  },
  {
    path: '/articles/new',
    name: 'article-new',
    authority: ['admin', 'user'],
    icon: 'read',
    hideInMenu: true,
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () =>
            import(/* webpackChunkName: "p__ArticleEdit__ArticleEdit" */ '../ArticleEdit/ArticleEdit'),
          LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
            .default,
        })
      : require('../ArticleEdit/ArticleEdit').default,
    exact: true,
  },
  {
    path: '/paste',
    name: 'paste',
    authority: ['admin', 'user'],
    icon: 'read',
    hideInMenu: true,
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () =>
            import(/* webpackChunkName: "p__Paste__Paste" */ '../Paste/Paste'),
          LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
            .default,
        })
      : require('../Paste/Paste').default,
    exact: true,
  },
  {
    path: '/demo',
    name: 'demo',
    authority: ['admin', 'user'],
    icon: 'read',
    hideInMenu: true,
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () =>
            import(/* webpackChunkName: "p__Demo__Demo" */ '../Demo/Demo'),
          LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
            .default,
        })
      : require('../Demo/Demo').default,
    exact: true,
  },
  {
    path: '/',
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () =>
            import(/* webpackChunkName: "layouts__BasicLayout" */ '../../layouts/BasicLayout'),
          LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
            .default,
        })
      : require('../../layouts/BasicLayout').default,
    Routes: [require('../Authorized').default],
    authority: ['admin', 'user'],
    routes: [
      {
        path: '/',
        redirect: '/platforms',
        exact: true,
      },
      {
        path: '/platforms',
        name: 'platforms',
        icon: 'cloud',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import(/* webpackChunkName: "p__PlatformList__PlatformList" */ '../PlatformList/PlatformList'),
              LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
                .default,
            })
          : require('../PlatformList/PlatformList').default,
        exact: true,
      },
      {
        path: '/articles',
        name: 'articles',
        icon: 'read',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import(/* webpackChunkName: "p__ArticleList__ArticleList" */ '../ArticleList/ArticleList'),
              LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
                .default,
            })
          : require('../ArticleList/ArticleList').default,
        exact: true,
      },
      {
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import(/* webpackChunkName: "p__404" */ '../404'),
              LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
                .default,
            })
          : require('../404').default,
        exact: true,
      },
      {
        component: () =>
          React.createElement(
            require('/Users/yeqing/projects/artipub/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'src/pages', hasRoutesInConfig: true },
          ),
      },
    ],
  },
  {
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import(/* webpackChunkName: "p__404" */ '../404'),
          LoadingComponent: require('/Users/yeqing/projects/artipub/src/components/PageLoading/index')
            .default,
        })
      : require('../404').default,
    exact: true,
  },
  {
    component: () =>
      React.createElement(
        require('/Users/yeqing/projects/artipub/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
          .default,
        { pagesPath: 'src/pages', hasRoutesInConfig: true },
      ),
  },
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen = () => {};

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    routeChangeHandler(history.location);
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return (
      <RendererWrapper0>
        <Router history={history}>{renderRoutes(routes, props)}</Router>
      </RendererWrapper0>
    );
  }
}
