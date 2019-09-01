import {Button, Card} from 'antd';
import * as React from 'react';
// @ts-ignore
import './Popup.scss';

interface AppProps {
}

interface AppState {
}

export default class Popup extends React.Component<AppProps, AppState> {
  constructor(props: AppProps, state: AppState) {
    super(props, state);
  }

  componentDidMount() {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({popupMounted: true});
  }

  onGetLoginInfo() {
    chrome.cookies.getAllCookieStores(cookieStores => {
      // console.log(cookieStores);
      cookieStores.forEach(store => {
        chrome.cookies.getAll({storeId: store.id}, cookies => {
          console.log(cookies);
        });
      });
    });
  }

  render() {
    return (
      <Card className="artipub-container">
        <h2>ArtiPub登陆助手</h2>
        <Button type="primary"
                onClick={this.onGetLoginInfo.bind(this)}>
          一键获取登陆信息
        </Button>
      </Card>
    )
  }
}
