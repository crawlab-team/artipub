import * as React from 'react';
import './Popup.scss';

interface AppProps {}

interface AppState {}

export default class Popup extends React.Component<AppProps, AppState> {
    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    componentDidMount() {
        // Example of how to send a message to eventPage.ts.
        chrome.runtime.sendMessage({ popupMounted: true });
    }

    openTab() {
        chrome.tabs.create({url: "tab.html"});
    }


    render() {
        return (
            <a className="button" onClick={this.openTab}>
                点击打开管理器
            </a>
        )
    }
}
