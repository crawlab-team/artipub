import {Button, Card, Input} from 'antd';
import * as React from 'react';
import axios from 'axios';
import './Popup.scss';

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

  componentDidMount() {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({popupMounted: true});

    this.setState({
      allowedDomains: [],
      configVisible: false,
      url: 'http://localhost:3000',
      fetched: false,
      loading: false,
    });
  }

  async onGetLoginInfo() {
    this.setState({
      loading: true
    });

    const response = await axios.get(this.state.url + '/platforms');
    const platforms = response.data.data;
    this.setState({
      allowedDomains: platforms.map((d: any) => d.name)
    });

    chrome.cookies.getAllCookieStores(cookieStores => {
      // console.log(cookieStores);
      cookieStores.forEach(store => {
        chrome.cookies.getAll({storeId: store.id}, cookies => {
          const data = cookies.filter(c => {
            for (let domain of this.state.allowedDomains) {
              if (c.domain.match(domain)) {
                return true
              }
            }
            return false
          });

          axios.post(this.state.url + '/cookies', data)
            .then(() => {
              this.setState({fetched: true});
            })
            .finally(() => {
              this.setState({loading: false});
            });
        });
      });
    });
  }

  onConfig() {
    this.setState({
      configVisible: !this.state.configVisible,
    })
  }

  onUrlChange(ev: any) {
    this.setState({
      url: ev.target.value,
    });
  }

  render() {
    let btn = (
      <Button type="primary"
              onClick={this.onGetLoginInfo.bind(this)}>
        一键获取登陆信息
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
        <Input value={this.state.url} className="input-url" placeholder="后端地址" onChange={this.onUrlChange.bind(this)}/>
      );
    }

    return (
      <Card className="artipub-container">
        <h2>
          ArtiPub登陆助手
          <Button type="primary" shape="circle" icon="tool" className="config-btn"
                  onClick={this.onConfig.bind(this)}/>
        </h2>
        {input}
        {btn}
      </Card>
    )
  }
}
