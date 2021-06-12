export default {
  juejin: {
    urls: {
      login: "https://juejin.cn/login",
      editor: "https://juejin.cn/editor/drafts/new",
    },
    loginSel: {
      username: '.input[name="loginPhoneOrEmail"]',
      password: '.input[name="loginPassword"]',
      submit: ".btn:nth-child(3)",
    },
    editorSel: {
      title: ".title-input",
      content: ".CodeMirror",
      publish: ".footer  button:nth-child(2)",
    },
    publishNavigationChange: true,
  },

  segmentfault: {
    urls: {
      login: "https://segmentfault.com/user/login",
      editor: "https://segmentfault.com/write?freshman=1",
    },
    loginSel: {
      username: 'input[name="username"]',
      password: 'input[name="password"]',
      submit: 'button[type="submit"]',
    },
    editorSel: {
      title: "input[name=title]",
      content: "#textarea-editor",
      publish: "#sureSubmitBtn",
    },
    publishNavigationChange: true,
  },

  jianshu: {
    urls: {
      login: "https://www.jianshu.com/sign_in",
      editor: "https://www.jianshu.com/writer",
    },
    loginSel: {
      username: "",
      password: "",
      submit: "",
    },
    editorSel: {
      title: 'input:not([name="name"])',
      content: "#arthur-editor",
      publish: 'a[data-action="publicize"]',
    },
    publishNavigationChange: false,
  },

  csdn: {
    urls: {
      login: "",
      editor: "https://editor.csdn.net/md/",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: ".article-bar__title--input",
      content: ".editor__inner",
      publish: ".btn-b-red",
    },
    publishNavigationChange: false,
  },

  devtoutiao: {
    urls: {
      login: "",
      editor: "https://toutiao.io/contribute?t=post",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: "#post_title",
      content: ".CodeMirror",
      publish: "input[type=submit]",
    },
    publishNavigationChange: true,
  },

  "51cto": {
    urls: {
      login: "",
      editor: "https://blog.51cto.com/blogger/publish",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: "#title",
      content: ".CodeMirror",
      publish: "#submit",
    },
    publishNavigationChange: true,
  },

  zhihu: {
    urls: {
      login: "",
      editor: "https://zhuanlan.zhihu.com/write",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: ".WriteIndex-titleInput > .Input",
      content: ".public-DraftEditor-content",
      publish: ".PublishPanel-stepTwoButton",
    },
    publishNavigationChange: true,
  },

  oschina: {
    urls: {
      login: "",
      editor: "",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: 'input[name="title"]',
      content: ".cke_editable",
      publish: ".submit",
    },
    publishNavigationChange: true,
  },

  toutiao: {
    urls: {
      login: "",
      editor: "https://mp.toutiao.com/profile_v4/graphic/publish",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: ".editor-title textarea",
      content: ".ProseMirror",
      publish: ".publish-btn-last",
    },
    publishNavigationChange: true,
  },

  cnblogs: {
    urls: {
      login: "",
      editor: "https://i.cnblogs.com/posts/edit",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: "#post-title",
      content: "#md-editor",
      publish: 'button[cnbellocator="publishBtn"]',
    },
    publishNavigationChange: true,
  },

  baijiahao: {
    urls: {
      login: "https://baijiahao.baidu.com/builder/theme/bjh/login",
      editor: "https://baijiahao.baidu.com/builder/rc/edit?type=news",
    },
    loginSel: {
      username: "#TANGRAM__PSP_4__userName",
      password: "#TANGRAM__PSP_4__password",
      submit: "#TANGRAM__PSP_4__submit",
    },
    editorSel: {
      title: ".input-container .ant-input",
      content: "ueditor",
      publish: ".op-publish",
    },
    publishNavigationChange: true,
  },

  v2ex: {
    urls: {
      login: "",
      editor: "https://www.v2ex.com/new",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: "#topic_title",
      content: "#editor",
      publish: ".super.normal.button",
    },
    publishNavigationChange: true,
  },

  wechat: {
    urls: {
      login: "",
      editor: "https://mp.weixin.qq.com",
      apiEndpoint: "https://api.weixin.qq.com/cgi-bin",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: "",
      content: "",
      publish: "",
    },
    publishNavigationChange: true,
  },
  aliyun: {
    urls: {
      login: "",
      editor: "https://developer.aliyun.com/article/new",
    },
    loginSel: {
      username: "",
      password: "",
    },
    editorSel: {
      title: "#title",
      content: ".textarea",
      publish: ".next-btn-primary",
    },
    publishNavigationChange: true,
  },
};
