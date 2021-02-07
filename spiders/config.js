module.exports = {
  juejin: {
    urls: {
      login: 'https://juejin.cn/login',
      editor: 'https://juejin.cn/editor/drafts/new'
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
      login: "",
      editor: "https://mp.toutiao.com/profile_v4/graphic/publish"
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: ".editor-title textarea",
      content: ".ProseMirror",
      publish: ".publish-btn-last"
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

  baijiahao: {
    urls: {
      login: "https://baijiahao.baidu.com/builder/theme/bjh/login",
      editor: "https://baijiahao.baidu.com/builder/rc/edit?type=news"
    },
    loginSel: {
      username: "#TANGRAM__PSP_4__userName",
      password: "#TANGRAM__PSP_4__password",
      submit: "#TANGRAM__PSP_4__submit"
    },
    editorSel: {
      title: ".input-container .ant-input",
      content: "ueditor",
      publish: '.op-publish'
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
  },
  aliyun: {
    urls: {
      login: '',
      editor: 'https://developer.aliyun.com/article/new'
    },
    loginSel: {
      username: '',
      password: ''
    },
    editorSel: {
      title: '#title',
      content: '.textarea',
      publish: '.next-btn-primary'
    }
  }
}
