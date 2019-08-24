import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ArticleTab from './ArticleTab';

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<ArticleTab />, document.getElementById('container'));
});
