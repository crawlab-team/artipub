import { DefaultFooter, MenuDataItem, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import DocumentTitle from 'react-document-title';
import { Link, connect, useIntl } from 'umi';
import React from 'react';

import SelectLang from "@/components/SelectLang";
import { ConnectProps  } from "umi";
import logo from '../assets/logo.png';
import styles from './UserLayout.less';

export interface UserLayoutProps extends ConnectProps {
  breadcrumbNameMap: { [path: string]: MenuDataItem };
}

const UserLayout: React.SFC<UserLayoutProps> = props => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);

  return (
    <DocumentTitle
      title={getPageTitle({
        pathname: location.pathname,
        breadcrumb,
        formatMessage: useIntl().formatMessage,
        ...props,
      })}
    >
      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>ArtiPub</span>
              </Link>
            </div>
            <div className={styles.desc}>内容创作者的搬运工，一处书写，随处可见</div>
          </div>
          {children}
        </div>
        <DefaultFooter links={[]} copyright={false}/>
      </div>
    </DocumentTitle>
  );
};

export default connect(({ settings }: any) => ({
  ...settings,
}))(UserLayout);
