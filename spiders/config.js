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
            content: '.ace_text-input',
            publish: '.publish-btn'
        }
    },

    segmentfault: {
        urls: {
            login: 'https://segmentfault.com/user/login',
            editor: 'https://segmentfault.com/write'
        },
        loginSel: {
            username: 'input[name="username"]',
            password: 'input[name="password"]',
            submit: 'button[type="submit"]'
        },
        editorSel: {
            title: '#myTitle',
            content: '#myEditor',
            publish: '#publishIt'
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
            editor: 'https://mp.csdn.net/postedit'
        },
        loginSel: {
            username: '',
            password: ''
        },
        editorSel: {
            title: '#txtTitle',
            content: '.htmledit_views',
            publish: '#btnPublish'
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
            content: '.RichText--editable',
            publish: '.PublishPanel-stepTwoButton'
        }
    }
}
