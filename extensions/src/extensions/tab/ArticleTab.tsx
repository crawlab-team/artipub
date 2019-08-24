import * as React from 'react';
import './ArticleTab.scss';
import * as ReactMarkdown from 'react-markdown';
import { Layout, Menu, Breadcrumb } from 'antd';

const { Header, Content, Footer } = Layout;

const source: string = "# ArtiPub"


interface AppProps {}

interface AppState {}

export default class ArticleTab extends React.Component<AppProps, AppState> {
    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    componentDidMount() {
        // Example of how to send a message to eventPage.ts.
        chrome.runtime.sendMessage({ popupMounted: true });
    }

    render() {
console.log(ReactMarkdown);
        return (
            <div>
    <Layout className="layout">
        {/* <ReactMarkdown source={source} /> */}
    <Header>
      {/* <div className="logo"> */}
      {/*   ArtiPub */}
      {/* </div> */}
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['1']}
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item key="1">文章管理</Menu.Item>
        <Menu.Item key="2">账户列表</Menu.Item>
      </Menu>
    </Header>
    <Content style={{ padding: '0 50px' }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>文章</Breadcrumb.Item>
        <Breadcrumb.Item>001</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
        <ReactMarkdown source={source} />
       </div>
    </Content>
    <Footer style={{ textAlign: 'center' }}>ArtiPub ©2019 Created by Crawlab Team</Footer>
  </Layout>
          </div>
        )
    }
}
