import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popup from './Popup';
import { browser } from "webextension-polyfill-ts";

let tabs = browser.tabs.query({ active: true, currentWindow: true });
tabs.then(function (tab) {
    ReactDOM.render(<Popup />, document.getElementById('container'));
})
