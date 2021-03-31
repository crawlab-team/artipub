import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import type { ConnectProps } from 'umi';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';
import type { ConnectState } from '@/models/connect';
import type { CurrentUser } from '@/models/user';

type SecurityLayoutProps = {
  loading?: boolean,
  currentUser?: CurrentUser,
  loginStatus: boolean,
} & Partial<ConnectProps>;

type SecurityLayoutState = {
  isReady: boolean;
};


class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'user/fetchLoginState',
      });
    }
  }

  render() {
    const {isReady} = this.state;
    const { children, loading, loginStatus : isLogin} = this.props;

    const queryString = stringify({
      redirect: window.location.href,
    });

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading />;
    }
    if (!isLogin && window.location.pathname !== '/user/login') {
      return <Redirect to={`/user/login?${queryString}`} />;
    }
    return children;
  }
}

export default connect(({ user, loading, login }: ConnectState): SecurityLayoutProps => ({
  currentUser: user.currentUser,
  loading: loading.models.login,
  loginStatus: user.isLogin,
}))(SecurityLayout);
