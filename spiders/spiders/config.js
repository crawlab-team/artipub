module.exports = {
    juejin: {
        urls: {
            login: 'https://juejin.im/login',
            editor: 'https://juejin.im/editor/drafts/new',
        },
        loginSel: {
            username: '.input[name="loginPhoneOrEmail"]',
            password: '.input[name="loginPassword"]',
            submit: '.btn:nth-child(3)',
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
            editor: 'https://segmentfault.com/write',
        },
        loginSel: {
            username: 'input[name="username"]',
            password: 'input[name="password"]',
            submit: 'button[type="submit"]',
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
            editor: '',
        },
        loginSel: {
            username: '#session_email_or_mobile_number',
            password: '#session_password',
            submit: '#sign-in-form-submit-btn',
        },
        editorSel: {
            title: '',
            content: '',
            publish: ''
        }
    }
}
