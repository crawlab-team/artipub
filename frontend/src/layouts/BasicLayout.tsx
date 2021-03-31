/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import React,  { useEffect, useMemo, useRef } from 'react';
import { Link, connect, setLocale, useIntl } from 'umi';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import {ConnectState, Dispatch} from '@/models/connect';
import {isAntDesignPro} from '@/utils/utils';
import { getMatchMenu } from '@umijs/route-utils'
import logo from '../assets/logo.png';
import style from './BasicLayout.less';
import {Row, Result, Button} from "antd";

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
)

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  settings: Settings;
  dispatch: Dispatch;
}

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map(item => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : [],
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const footer = (
  <div className={style.footer}>
    <Row className={style.info}>
      <span className={style.name}>ArtiPub</span>
      <span className={style.slogan}>内容创作者的搬运工，一处书写，随处可见</span>
      <a className={style.github} href="https://github.com/crawlab-team/artipub" target="_blank">
        <img src="https://img.shields.io/github/stars/crawlab-team/artipub?logo=github"/>
      </a>
    </Row>
    <Row className={style.copyright}>
      Copyright (c) 2021, Crawlab Team All rights reserved.
    </Row>
  </div>
);

const footerRender: BasicLayoutProps['footerRender'] = (_, defaultDom) => {
  if (!isAntDesignPro()) {
    return footer;
  }
  return (
    <>
      {defaultDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const { dispatch, children, settings } = props;
  const { formatMessage } = useIntl();

  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'settings/getSetting',
      });
    }
  }, []);

  const menuDataRef = useRef<MenuDataItem[]>([]);

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void =>
    dispatch &&
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload,
    });

    // get children authority
    const authorized = useMemo(
      () =>
        getMatchMenu(location.pathname || '/', menuDataRef.current).pop() || {
          authority: 'admin',
        },
      [location.pathname],
    )

  // set locale default as zh-CN
  setLocale('zh-CN');

  return (
    <ProLayout
      logo={logo}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl) {
          return defaultDom;
        }
        //@ts-ignore
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
            defaultMessage: 'Home',
          }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={footerRender}
      menuDataRender={menuDataRender}
      formatMessage={formatMessage}
      rightContentRender={rightProps => <RightContent {...rightProps} />}
      {...props}
      {...settings}
    >
       <Authorized authority={authorized!.authority} noMatch={noMatch}>
        {children}
      </Authorized>
    </ProLayout>
  );
};

export default connect(({global, settings}: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
