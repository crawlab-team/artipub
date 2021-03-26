import * as React from 'react';
import { Button, Card, Input } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';
import './styles.less';

interface AppProps {
}

interface AppState {
  allowedDomains: string[];
  configVisible: boolean;
  url: string;
  fetched: boolean;
  loading: boolean;
}

export default class Popup extends React.Component<AppProps, AppState> {
  constructor(props: AppProps, state: AppState) {
    super(props, state);
  }
  __webpack_nonce__ = "";
  componentDidMount() {
    // Example of how to send a message to eventPage.ts.
    // browser.runtime.sendMessage({ popupMounted: true });

    this.setState({
      allowedDomains: [],
      configVisible: false,
      url: localStorage.getItem('url') || 'http://localhost:3000',
      fetched: false,
      loading: false,
    });
  }
  async commitCookies() {
    let cookieStores = await browser.cookies.getAllCookieStores();
    // console.log(cookieStores);
    cookieStores.forEach(async store => {
      let cookies = await browser.cookies.getAll({ storeId: store.id });
      const data = cookies.filter(c => {
        if (c.domain.match('aliyun')) {
          if (c.domain == '.aliyun.com' || c.domain == 'developer.aliyun.com') {
            return true
          }
          return false
        }
        for (let domain of this.state.allowedDomains) {
          if (c.domain.match(domain)) {
            return true
          }
        }
        return false
      });

      axios.post(this.state.url + '/cookies', data)
        .then(() => {
          this.setState({ fetched: true });
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    });
  }
  onGetLoginInfo() {
    this.setState({
      loading: true
    });

    axios.get(this.state.url + '/platforms')
      .then((response) => {
        const platforms = response.data.data;
        this.setState({
          allowedDomains: platforms.map((d: any) => d.name)
        });
        this.commitCookies()
      })
      .catch(function (error) {
        console.error(error);
      })
  }

  onConfig() {
    this.setState({
      configVisible: !this.state.configVisible,
    })
  }

  onUrlChange(ev: any) {
    localStorage.setItem('url', ev.target.value);
    this.setState({
      url: ev.target.value,
    });
  }

  render() {
    let btn = (
      <Button type="primary"
        onClick={this.onGetLoginInfo.bind(this)}>
        一键获取登陆
      </Button>
    );
    if (this.state && this.state.loading) {
      btn = (
        <Button type="primary" loading={true}>
          正在获取
        </Button>
      )
    } else if (this.state && this.state.fetched) {
      btn = (
        <Button className="success" type="primary">
          已成功获取
        </Button>
      )
    }

    let input;
    if (this.state && this.state.configVisible) {
      input = (
        <Input value={this.state.url} className="input-url" placeholder="后端地址" onChange={this.onUrlChange.bind(this)} />
      );
    }

    return (
      <Card className="artipub-container">
        <h2>
          ArtiPub登陆助手
          <Button type="primary" shape="circle" icon={<SettingOutlined />} className="config-btn"
            onClick={this.onConfig.bind(this)} />
        </h2>
        {input}
        {btn}
      </Card>
    )
  }
}
