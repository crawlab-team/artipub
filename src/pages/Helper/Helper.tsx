import React from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Card, Row} from "antd";
import style from './Helper.scss'

const Helper: React.FC<any> = () => {
  const onDownload = () => {
    window.location.pathname = '/artipub-helper.zip'
  };

  return (
    <PageHeaderWrapper>
      <Row style={{textAlign: 'right'}}>
        <Button type="primary" onClick={onDownload}>下载登陆助手</Button>
      </Row>
      <Row style={{marginTop: '20px'}}>
        <Card>
          <h3>登陆助手试用步骤</h3>
          <ul className={style.step}>
            <li>1. 点击"下载登陆助手"，保存文件名为"artipub-helper.zip"</li>
            <li>2. 在Chrome浏览器种输入"chrome://extensions"</li>
            <li>3. 将下载的登陆助手文件artipub-helper.zip拖入浏览器中，浏览器将自动安装插件</li>
            <li>4. 在使用登陆助手之前，请确保您的各个平台账号已经处于登陆状态</li>
            <li>5. 右上角点击安装好的插件按钮，点击"一键获取登陆信息"，插件将获取所有平台的Cookie</li>
            <li>6. 到"平台管理"页面，查看"Cookie状态"，确保其为"已导入"状态</li>
            <li>7. 到"文章管理"页面，点击"发布"，选择登陆方式为"Cookie"，然后发布文章</li>
          </ul>
        </Card>
      </Row>
    </PageHeaderWrapper>
  );
};

export default Helper;
