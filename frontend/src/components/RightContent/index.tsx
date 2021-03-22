import { Tooltip, Space } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import React from 'react';
import { useModel } from 'umi';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <Tooltip title="Github">
        <a href="https://github.com/crawlab-team/artipub" target="_blank">
          <GithubOutlined className={styles.github} />
        </a>
      </Tooltip>
    </Space>
  );
};
export default GlobalHeaderRight;
