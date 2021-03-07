import { GithubOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';
import {  ConnectState } from "@/models/connect";
import { ConnectProps, connect } from 'umi'

import styles from './index.less';

export type SiderTheme = 'light' | 'dark';
export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = props => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      <Tooltip title="Github">
        <a href="https://github.com/crawlab-team/artipub" target="_blank">
          <GithubOutlined className={styles.github} />
        </a>
      </Tooltip>
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
