module.exports = {
  juejin: {
    urls: {
      login: 'https://juejin.im/login',
      editor: 'https://juejin.im/editor/drafts/new'
    },
    loginSel: {
      username: '.input[name="loginPhoneOrEmail"]',
      password: '.input[name="loginPassword"]',
      submit: '.btn:nth-child(3)'
    },
    editorSel: {
      title: '.title-input',
      content: '.CodeMirror',
      publish: '.publish-btn'
    }
  },

  segmentfault: {
    urls: {
      login: 'https://segmentfault.com/user/login',
      editor: 'https://segmentfault.com/write?freshman=1'
    },
    loginSel: {
      username: 'input[name="username"]',
      password: 'input[name="password"]',
      submit: 'button[type="submit"]'
    },
    editorSel: {
      title: '#title',
      content: '.CodeMirror',
      publish: '#sureSubmitBtn'
    }
  },

  jianshu: {
    urls: {
      login: 'https://www.jianshu.com/sign_in',
      editor: 'https://www.jianshu.com/writer'
    },
    loginSel: {
      username: '',
      password: '',
      submit: ''
    },
    editorSel: {
      title: 'input:not([name="name"])',
      content: '#arthur-editor',
      publish: 'a[data-action="publicize"]'
    }
  },

  csdn: {
    urls: {
      login: '',
      editor: 'https://editor.csdn.net/md/'
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: '.article-bar__title--input',
      content: '.editor__inner',
      publish: '.btn-b-red'
    }
  },

  zhihu: {
    urls: {
      login: '',
      editor: 'https://zhuanlan.zhihu.com/write'
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: '.WriteIndex-titleInput > .Input',
      content: '.public-DraftEditor-content',
      publish: '.PublishPanel-stepTwoButton'
    }
  },

  oschina: {
    urls: {
      login: '',
      editor: ''
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: 'input[name="title"]',
      content: '.cke_editable',
      publish: '.submit'
    }
  },

  toutiao: {
    urls: {
      login: '',
      editor: 'https://mp.toutiao.com/profile_v3/graphic/publish'
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: '#title',
      content: '.ql-editor',
      publish: '#publish'
    }
  },

  cnblogs: {
    urls: {
      login: '',
      editor: 'https://i.cnblogs.com/articles/edit'
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: '#post-title',
      content: '#md-editor',
      publish: 'button[data-el-locator="publishBtn"]'
    }
  },

  v2ex: {
    urls: {
      login: '',
      editor: 'https://v2ex.com/new'
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: '#topic_title',
      content: '#editor',
      publish: '.super.normal.button'
    }
  },

  wechat: {
    urls: {
      login: '',
      editor: 'https://mp.weixin.qq.com',
      apiEndpoint: 'https://api.weixin.qq.com/cgi-bin'
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: '',
      content: '',
      publish: ''
    }
  }
}
