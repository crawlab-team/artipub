import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Form, Input, Modal, Select, Spin, Table, Tag, Tooltip} from 'antd';
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

  const onImport = () => {
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
        if (d.name === constants.platform.JUEJIN) {
          return <img className={style.siteLogo} src={imgJuejin}/>;
        } else if (d.name === constants.platform.SEGMENTFAULT) {
          return <img className={style.siteLogo} src={imgSegmentfault}/>;
        } else if (d.name === constants.platform.JIANSHU) {
          return <img className={style.siteLogo} src={imgJianshu}/>;
        } else if (d.name === constants.platform.CSDN) {
          return <img className={style.siteLogo} src={imgCsdn}/>;
        } else {
          return <span>Logo</span>;
        }
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
        let shortText = text
        if (text && text.length > 50) {
          shortText = shortText.substr(0, 50) + '...'
        }
        return (
          <div className={style.description} title={text}>
            {shortText}
          </div>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: '180px',
      render: (text, d) => {
        return (
          <div>
            <Tooltip title="导入文章">
              <Button
                type="primary"
                shape="circle"
                icon="import"
                className={style.fetchBtn}
                onClick={onFetch(d)}
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
      dataIndex: '_id',
      key: '_id',
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
    await dispatch({
      type: 'platform/saveSiteArticles',
      payload: selectedSiteArticles,
    });
  };

  const onSiteArticleSelectAll = async (selected: boolean, selectedSiteArticles: Object[]) => {
    await dispatch({
      type: 'platform/saveSiteArticles',
      payload: selectedSiteArticles,
    });
  };

  const siteArticlesRowSelection: TableRowSelection<any> = {
    selectedRowKeys: platform.siteArticles
      ? platform.siteArticles.filter((d: SiteArticle) => d.checked).map((d: SiteArticle) => d.url)
      : [],
    onSelect: onSiteArticleSelect,
    onSelectAll: onSiteArticleSelectAll,
  };

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'platform/fetchPlatformList',
      });
    }
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
        onOk={onImport}
        onCancel={onFetchModalCancel}
      >
        <Spin spinning={platform.fetchLoading} tip="正在获取文章，需要大约30-60秒，请耐心等待...">
          <Table
            rowSelection={siteArticlesRowSelection}
            dataSource={platform.siteArticles}
            columns={siteArticlesColumns}
          />
        </Spin>
      </Modal>
      {/*<div className={style.actions}>*/}
      {/*  <Button className={style.addBtn} type="primary" onClick={onAdd}>添加平台</Button>*/}
      {/*</div>*/}
      <Table dataSource={platform.platforms} columns={columns}/>
    </PageHeaderWrapper>
  );
};

export default connect(({platform}: ConnectState) => ({
  platform,
}))(PlatformList);
