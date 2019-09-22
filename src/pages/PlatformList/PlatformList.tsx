import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Card, Form, Input, Modal, Select, Spin, Table, Tag, Tooltip} from 'antd';
import {Platform, PlatformModelState, SiteArticle} from '@/models/platform';
import {ConnectProps, ConnectState, Dispatch} from '@/models/connect';
import {connect} from 'dva';
import {ColumnProps, SelectionSelectFn, TableRowSelection} from 'antd/lib/table';
import style from './PlatformList.scss';
import constants from '@/constants';

// logo images
import imgJuejin from '@/assets/img/juejin-logo.svg';
import imgSegmentfault from '@/assets/img/segmentfault-logo.jpg';
import imgJianshu from '@/assets/img/jianshu-logo.png';
import imgCsdn from '@/assets/img/csdn-logo.jpg';
import imgZhihu from '@/assets/img/zhihu-logo.jpg';
import imgOschina from '@/assets/img/oschina-logo.jpg';
import imgToutiao from '@/assets/img/toutiao-logo.png';
import imgCnblogs from '@/assets/img/cnblogs-logo.gif';
import imgV2ex from '@/assets/img/v2ex-logo.jpg';

export interface PlatformListProps extends ConnectProps {
  platform: PlatformModelState;
  dispatch: Dispatch;
}

const PlatformList: React.FC<PlatformListProps> = props => {
  const {dispatch, platform} = props;

  // const onEdit: Function = (d: Platform) => {
  //   return () => {
  //     dispatch({
  //       type: 'platform/saveCurrentPlatform',
  //       payload: d,
  //     });
  //     dispatch({
  //       type: 'platform/saveModalVisible',
  //       payload: true,
  //     });
  //   };
  // };
  //
  // const onAdd = () => {
  //   dispatch({
  //     type: 'platform/saveCurrentPlatform',
  //     payload: {
  //       name: '',
  //       label: '',
  //       description: '',
  //     }
  //   });
  //   dispatch({
  //     type: 'platform/saveModalVisible',
  //     payload: true,
  //   });
  // };
  //
  // const onDelete: Function = (d: Platform) => {
  //   return async () => {
  //     if (dispatch) {
  //       await dispatch({
  //         type: 'platform/deletePlatform',
  //         payload: d
  //       });
  //       await dispatch({
  //         type: 'platform/fetchPlatformList',
  //       });
  //     }
  //   };
  // };

  const onFieldChange: Function = (type: string, fieldName: string) => {
    return (ev: any) => {
      const currentPlatform = platform.currentPlatform;
      if (currentPlatform) {
        if (type === constants.inputType.INPUT) {
          currentPlatform[fieldName] = ev.target.value;
        } else if (type === constants.inputType.SELECT) {
          currentPlatform[fieldName] = ev;
        }
        dispatch({
          type: 'platform/saveCurrentPlatform',
          payload: currentPlatform,
        });
      }
    };
  };

  const onModalCancel = () => {
    dispatch({
      type: 'platform/saveModalVisible',
      payload: false,
    });
  };

  const onSave = async () => {
    if (platform.currentPlatform) {
      if (platform.currentPlatform._id) {
        // 更改
        await dispatch({
          type: 'platform/savePlatform',
          payload: platform.currentPlatform,
        });
      } else {
        // 新增
        await dispatch({
          type: 'platform/addPlatform',
          payload: platform.currentPlatform,
        });
      }
      await dispatch({
        type: 'platform/fetchPlatformList',
      });
      await dispatch({
        type: 'platform/saveModalVisible',
        payload: false,
      });
    }
  };

  const onFetch: Function = (d: Platform) => {
    return async () => {
      await dispatch({
        type: 'platform/saveFetchModalVisible',
        payload: true,
      });
      await dispatch({
        type: 'platform/fetchSiteArticles',
        payload: d,
      });
      await dispatch({
        type: 'platform/saveCurrentPlatform',
        payload: d,
      });
    };
  };

  const onFetchModalCancel = () => {
    dispatch({
      type: 'platform/saveFetchModalVisible',
      payload: false,
    });
  };

  const onImport = async () => {
    await dispatch({
      type: 'platform/saveImportProgressModalVisible',
      payload: true,
    });
    await dispatch({
      type: 'platform/importArticles',
      payload: {
        platformId: platform.currentPlatform ? platform.currentPlatform._id : '',
        siteArticles: platform.siteArticles
          ? platform.siteArticles.filter((d: SiteArticle) => d.checked)
          : [],
      },
    });
  };

  const onAccount: Function = (d: Platform) => {
    return async () => {
      await dispatch({
        type: 'platform/saveAccountModalVisible',
        payload: true,
      });
      await dispatch({
        type: 'platform/saveCurrentPlatform',
        payload: d,
      });
      TDAPP.onEvent('平台管理-打开账户设置')
    };
  };

  const onAccountModalCancel = async () => {
    await dispatch({
      type: 'platform/saveAccountModalVisible',
      payload: false,
    });
    TDAPP.onEvent('平台管理-取消账户设置')
  };

  const onAccountSave = async () => {
    await dispatch({
      type: 'platform/savePlatform',
      payload: platform.currentPlatform,
    });
    await dispatch({
      type: 'platform/saveAccountModalVisible',
      payload: false,
    });
    TDAPP.onEvent('平台管理-保存账户设置')
  };

  const getStatsComponent = (d: any) => {
    d.readNum = d.readNum || 0;
    d.likeNum = d.likeNum || 0;
    d.commentNum = d.commentNum || 0;
    return (
      <div>
        <Tooltip title={'阅读数: ' + d.readNum.toString()}>
          <Tag color="green">{d.readNum}</Tag>
        </Tooltip>
        <Tooltip title={'点赞数: ' + d.likeNum.toString()}>
          <Tag color="orange">{d.likeNum}</Tag>
        </Tooltip>
        <Tooltip title={'评论数: ' + d.commentNum.toString()}>
          <Tag color="blue">{d.commentNum}</Tag>
        </Tooltip>
      </div>
    );
  };

  const columns: ColumnProps<any>[] = [
    {
      title: '图标',
      width: '80px',
      dataIndex: '_id',
      key: '_id',
      render: (text: string, d: Platform) => {
        let img = <span>Logo</span>;
        if (d.name === constants.platform.JUEJIN) {
          img = <img className={style.siteLogo} src={imgJuejin}/>;
        } else if (d.name === constants.platform.SEGMENTFAULT) {
          img = <img className={style.siteLogo} src={imgSegmentfault}/>;
        } else if (d.name === constants.platform.JIANSHU) {
          img = <img className={style.siteLogo} src={imgJianshu}/>;
        } else if (d.name === constants.platform.CSDN) {
          img = <img className={style.siteLogo} src={imgCsdn}/>;
        } else if (d.name === constants.platform.ZHIHU) {
          img = <img className={style.siteLogo} src={imgZhihu}/>;
        } else if (d.name === constants.platform.OSCHINA) {
          img = <img className={style.siteLogo} src={imgOschina}/>;
        } else if (d.name === constants.platform.TOUTIAO) {
          img = <img className={style.siteLogo} src={imgToutiao}/>;
        } else if (d.name === constants.platform.CNBLOGS) {
          img = <img className={style.siteLogo} alt={d.label} src={imgCnblogs}/>;
        } else if (d.name === constants.platform.V2EX) {
          img = <img className={style.siteLogo} alt={d.label} src={imgV2ex}/>;
        }
        return (
          <a href={d.url} target="_blank">
            {img}
          </a>
        )
      },
    },
    {
      title: '平台代号',
      dataIndex: 'name',
      key: 'name',
      width: '180px',
    },
    {
      title: '平台名称',
      dataIndex: 'label',
      key: 'label',
      width: '180px',
    },
    {
      title: '平台描述',
      dataIndex: 'description',
      key: 'description',
      width: 'auto',
      render: text => {
        let shortText = text;
        if (text && text.length > 50) {
          shortText = shortText.substr(0, 50) + '...';
        }
        return (
          <div className={style.description} title={text}>
            {shortText}
          </div>
        );
      },
    },
    {
      title: 'Cookie状态',
      dataIndex: 'cookieStatus',
      key: 'cookieStatus',
      width: '120px',
      render: (text: string, d: Platform) => {
        if (d.loggedIn) {
          return (
            <Tooltip title="可以发布文章到该平台">
              <Tag color="green">已导入</Tag>
            </Tooltip>
          )
        } else {
          return (
            <Tooltip title="请用登陆助手导入Cookie">
              <Tag color="red">未导入</Tag>
            </Tooltip>
          );
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: '180px',
      render: (text: string, d: Platform) => {
        return (
          <div>
            <Tooltip title="导入文章">
              <Button
                disabled={!d.enableImport}
                type="primary"
                shape="circle"
                icon="import"
                className={style.fetchBtn}
                onClick={onFetch(d)}
              />
            </Tooltip>
            <Tooltip title="设置登陆用户名密码">
              <Button
                disabled={!d.enableLogin}
                type="default"
                shape="circle"
                icon="key"
                className={style.loginBtn}
                onClick={onAccount(d)}
              />
            </Tooltip>
            {/*<Popconfirm title="您确认删除该平台吗？" onConfirm={onDelete(d)}>*/}
            {/*  <Button type="danger" shape="circle" icon="delete" className={style.delBtn}/>*/}
            {/*</Popconfirm>*/}
          </div>
        );
      },
    },
  ];

  const siteArticlesColumns: ColumnProps<any>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '400px',
      render: (text: string, d: SiteArticle) => {
        return (
          <a href={d.url} target="_blank">
            {text}
          </a>
        );
      },
    },
    {
      title: '存在状态',
      dataIndex: 'exists',
      key: 'exits',
      width: '80px',
      render: (text: string, d: SiteArticle) => {
        if (d.exists) {
          return <Tag color="green">已存在</Tag>;
        } else {
          return <Tag color="red">不存在</Tag>;
        }
      },
    },
    {
      title: '关联状态',
      dataIndex: 'associated',
      key: 'associated',
      width: '80px',
      render: (text: string, d: SiteArticle) => {
        if (d.associated) {
          return <Tag color="green">已关联</Tag>;
        } else {
          return <Tag color="red">未关联</Tag>;
        }
      },
    },
    {
      title: '数据统计',
      dataIndex: 'url',
      key: 'url',
      width: '200px',
      render: (text: string, d: SiteArticle) => {
        return getStatsComponent(d);
      },
    },
  ];

  const onSiteArticleSelect: SelectionSelectFn<any> = async (
    d: any,
    selected: boolean,
    selectedSiteArticles: Object[],
    nativeEvent: Event,
  ) => {
    const siteArticles = platform.siteArticles || [];
    for (let i = 0; i < siteArticles.length; i++) {
      siteArticles[i].checked = selectedSiteArticles
        .map((d: any) => d.url)
        .includes(siteArticles[i].url);
    }
    await dispatch({
      type: 'platform/saveSiteArticles',
      payload: siteArticles,
    });
  };

  const onSiteArticleSelectAll = async (selected: boolean) => {
    const siteArticles = platform.siteArticles || [];
    for (let i = 0; i < siteArticles.length; i++) {
      siteArticles[i].checked = selected;
    }
    await dispatch({
      type: 'platform/saveSiteArticles',
      payload: siteArticles,
    });
  };

  const siteArticlesRowSelection: TableRowSelection<any> = {
    selectedRowKeys: platform.siteArticles
      ? platform.siteArticles.filter((d: SiteArticle) => d.checked).map((d: SiteArticle) => d.url)
      : [],
    onSelect: onSiteArticleSelect,
    onSelectAll: onSiteArticleSelectAll,
  };

  const getTip = () => {
    if (platform.fetchLoading) {
      return '正在获取文章列表，需要大约15-60秒，请耐心等待...';
    } else if (platform.importLoading) {
      const articleNum = platform.siteArticles
        ? platform.siteArticles.filter(d => d.checked && (!d.exists || !d.associated)).length
        : 0;
      return `正在导入文章，需要大约${15 * articleNum}秒（每篇文章大约15秒），请耐心等待...`;
    } else {
      return '';
    }
  };

  const onUpdateCookieStatus = () => {
    dispatch({
      type: 'platform/updateCookieStatus',
    });
  };

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'platform/fetchPlatformList',
      });
    }

    TDAPP.onEvent('平台管理-访问页面');
  }, []);

  return (
    <PageHeaderWrapper>
      <Modal
        title={platform.currentPlatform && platform.currentPlatform._id ? '更改平台' : '新增平台'}
        visible={platform.modalVisible}
        onOk={onSave}
        onCancel={onModalCancel}
      >
        <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
          <Form.Item label="代号">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.name : ''}
              onChange={onFieldChange(constants.inputType.INPUT, 'name')}
            />
          </Form.Item>
          <Form.Item label="名称">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.label : ''}
              onChange={onFieldChange(constants.inputType.INPUT, 'label')}
            />
          </Form.Item>
          <Form.Item label="编辑器类别">
            <Select
              value={platform.currentPlatform ? platform.currentPlatform.editorType : ''}
              onChange={onFieldChange(constants.inputType.SELECT, 'editorType')}
            >
              <Select.Option key={constants.editorType.MARKDOWN}>Markdown</Select.Option>
              <Select.Option key={constants.editorType.RICH_TEXT}>富文本编辑</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea
              value={platform.currentPlatform ? platform.currentPlatform.description : ''}
              onChange={onFieldChange(constants.inputType.INPUT, 'description')}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="导入文章"
        visible={platform.fetchModalVisible}
        width="1000px"
        closable={false}
        maskClosable={false}
        onOk={onImport}
        okText="导入"
        onCancel={onFetchModalCancel}
        okButtonProps={{
          disabled: platform.fetchLoading,
          loading: platform.importLoading,
        }}
        cancelButtonProps={{
          disabled: platform.fetchLoading || platform.importLoading,
        }}
      >
        <Spin spinning={platform.fetchLoading || platform.importLoading} tip={getTip()}>
          <Table
            rowSelection={siteArticlesRowSelection}
            dataSource={
              platform.siteArticles
                ? platform.siteArticles.map((d: SiteArticle) => {
                  return {
                    key: d.url,
                    ...d,
                  };
                })
                : []
            }
            columns={siteArticlesColumns}
          />
        </Spin>
      </Modal>
      <Modal
        visible={platform.accountModalVisible}
        onCancel={onAccountModalCancel}
        onOk={onAccountSave}
      >
        <Form>
          <Form.Item label="登陆用户名">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.username : ''}
              placeholder="请输入登陆用户名"
              onChange={onFieldChange(constants.inputType.INPUT, 'username')}
            />
          </Form.Item>
          <Form.Item label="登陆密码">
            <Input
              value={platform.currentPlatform ? platform.currentPlatform.password : ''}
              type="password"
              placeholder="请输入登陆密码"
              onChange={onFieldChange(constants.inputType.INPUT, 'password')}
            />
          </Form.Item>
        </Form>
      </Modal>
      {/*<div className={style.actions}>*/}
      {/*  <Button className={style.addBtn} type="primary" onClick={onAdd}>添加平台</Button>*/}
      {/*</div>*/}
      <div style={{textAlign: 'right', marginBottom: '20px'}}>
        <Button
          type="primary"
          loading={platform.updateCookieStatusLoading}
          onClick={onUpdateCookieStatus}
          icon="sync"
        >
          更新Cookie状态
        </Button>
      </div>
      <Card>
        <Table dataSource={platform.platforms} columns={columns}/>
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({platform}: ConnectState) => ({
  platform,
}))(PlatformList);
