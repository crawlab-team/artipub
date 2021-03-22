import React from 'react';
import { DefaultFooter } from '@ant-design/pro-layout';

const Aritpub = React.createElement(
  'div',
  null,
  React.createElement('span', null, 'AritPub让你的文章随处可阅'),
  React.createElement('img', {
    src: 'https://img.shields.io/github/stars/crawlab-team/artipub?logo=github',
    style: { marginLeft: '10px' },
  }),
);
export default () => (
  <DefaultFooter
    copyright="2019 Crawlab Team All rights reserved"
    links={[
      {
        key: 'Aritpub',
        title: Aritpub,
        href: 'https://github.com/crawlab-team/artipub',
        blankTarget: true,
      },
    ]}
  />
);
