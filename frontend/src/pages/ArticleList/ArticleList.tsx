import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Checkbox, Form, Input, message, Modal, Popconfirm, Select, Table, Tag} from "antd";
import {Article, ArticleModelState, Platform} from "@/models/article";
import {ConnectProps, ConnectState, Dispatch} from "@/models/connect";
import {connect} from "dva";
import {ColumnProps} from "antd/lib/table";
import router from "umi/router";
import style from './ArticleList.scss'
import moment from "moment";

// logo images
import imgJuejin from '@/assets/img/juejin-logo.svg';
import imgSegmentfault from '@/assets/img/segmentfault-logo.jpg';
import imgJianshu from '@/assets/img/jianshu-logo.png';

export interface ArticleListProps extends ConnectProps {
  article: ArticleModelState;
  dispatch: Dispatch;
}

const ArticleList: React.FC<ArticleListProps> = props => {
  const {dispatch, article} = props;

  const onEdit: Function = (d: Article) => {
    return () => {
      router.push(`/articles/edit/${d._id}`);
    }
  };

  const onDelete: Function = (d: Article) => {
    return () => {
      if (dispatch) {
        dispatch({
          type: 'article/deleteArticle',
          payload: d
        }).then(() => {
          dispatch({
            type: 'article/fetchArticleList',
          })
        });
      }
    }
  };

  const onNew = () => {
    if (dispatch) {
      dispatch({
        type: 'article/resetArticle',
      });
    }
    router.push('/articles/new')
  };

  const onPublishPopup: Function = (d: any) => {
    return async () => {
      if (dispatch) {
        await dispatch({
          type: 'article/fetchArticle',
          payload: {
            id: d._id
          }
        });
        await dispatch({
          type: 'article/setPubModalVisible',
          payload: true,
        });
        await dispatch({
          type: 'article/resetPlatform',
          payload: true,
        });
      }
    }
  };

  const onPubModalCancel = () => {
    if (dispatch) {
      dispatch({
        type: 'article/setPubModalVisible',
        payload: false,
      })
    }
  };

  const onPlatformCheck: Function = (d: Platform) => {
    return (ev: any) => {
      if (dispatch) {
        dispatch({
          type: 'article/checkPlatform',
          payload: {
            name: d.name,
            checked: ev.target.checked,
          },
        })
      }
    };
  };

  const onPublish: Function = () => {
    return async () => {
      if (dispatch) {
        if (article.platformList && article.currentArticle) {
          const platforms = article.platformList.filter(d => d.checked).map(d => d.name).join(',');
          await dispatch({
            type: 'article/publishArticle',
            payload: {
              id: article.currentArticle._id,
              platforms
            }
          });
          await dispatch({
            type: 'article/fetchArticleList',
          });
          message.success('已开始发布')
        }
      }
    };
  };

  const onViewArticle: Function = (d: any) => {
    return () => {
      if (article.currentArticle) {
        window.open(article.currentArticle[d.name].url);
      }
    }
  };

  const onConfig: Function = (d: Platform) => {
    return () => {
      if (dispatch) {
        dispatch({
          type: 'article/setCurrentPlatform',
          payload: d,
        });
        dispatch({
          type: 'article/setPlatformModalVisible',
          payload: true,
        });
      }
    };
  };

  const onConfigCancel = () => {
    dispatch({
      type: 'article/setPlatformModalVisible',
      payload: false,
    });
  };

  const onChangePlatformConfig: Function = (platform: string, key: string) => {
    return (ev: any) => {
      if (article.currentArticle) {
        if (!article.currentArticle.platforms) article.currentArticle.platforms = {};
        article.currentArticle.platforms[platform][key] = ev.target.value;
        dispatch({
          type: 'article/saveCurrentArticle',
          payload: article.currentArticle,
        })
      }
    };
  };

  const columns: ColumnProps<any>[] = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      width: '400px',
    },
    {
      title: '创建时间',
      dataIndex: 'createTs',
      key: 'createTs',
      width: '180px',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTs',
      key: 'updateTs',
      width: '180px',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, d) => {
        return (
          <div>
            <Button type="primary" shape="circle" icon="cloud" className={style.pubBtn} onClick={onPublishPopup(d)}/>
            <Button type="default" shape="circle" icon="edit" className={style.editBtn} onClick={onEdit(d)}/>
            <Popconfirm title="您确认删除该文章吗？" onConfirm={onDelete(d)}>
              <Button type="danger" shape="circle" icon="delete" className={style.delBtn}/>
            </Popconfirm>
          </div>
        )
      }
    }
  ];

  const taskColumns: ColumnProps<any>[] = [
    {
      title: '',
      key: 'checkbox',
      dataIndex: 'checkbox',
      width: '40px',
      render: (text, d) => {
        return (
          <Checkbox checked={d.checked} onChange={onPlatformCheck(d)}/>
        );
      },
    },
    {
      title: '平台',
      key: 'icon',
      dataIndex: 'icon',
      width: '80px',
      render: (text, d) => {
        if (d.platform === 'juejin') {
          return <img className={style.siteLogo} alt={d.label} src={imgJuejin}/>
        } else if (d.platform === 'segmentfault') {
          return <img className={style.siteLogo} alt={d.label} src={imgSegmentfault}/>
        } else {
          return <div/>
        }
      },
    },
    {
      title: '名称',
      key: 'label',
      dataIndex: 'label',
      width: '180px',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: '120px',
      render: (text, d) => {
        let el = <Tag color="grey">未发布</Tag>;
        if (article.currentArticle && article.currentArticle[d.name] && article.currentArticle[d.name].status === 'processing') {
          el = <Tag color="orange">正在发布</Tag>;
        } else if (article.currentArticle && article.currentArticle[d.name] && article.currentArticle[d.name].status === 'error') {
          el = <Tag color="red">错误</Tag>;
        } else if (article.currentArticle && article.currentArticle[d.name] && article.currentArticle[d.name].url) {
          el = <Tag color="green">已发布</Tag>;
        }
        return el
      }
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: '120px',
      render: (text, d) => {
        let isFinished = false;
        if (article.currentArticle && article.currentArticle[d.name] && article.currentArticle[d.name].url) {
          isFinished = true;
        }
        return (
          <div>
            {/*<Button disabled={isFinished} type="primary" shape="circle" icon="cloud" onClick={onPublish(d)}/>*/}
            <Button disabled={!isFinished} type="default" shape="circle" icon="search"
                    className={style.viewBtn} onClick={onViewArticle(d)}/>
            <Button type="primary" shape="circle" icon="tool"
                    className={style.configBtn} onClick={onConfig(d)}/>
          </div>
        )
      }
    }
  ];

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'article/fetchArticleList',
      });
    }
  }, []);

  // 平台配置
  let platformContent = <div></div>;
  if (article.currentPlatform && article.currentArticle) {
    if (article.currentPlatform.name === 'juejin') {
      const categories = [
        '前端',
        '后端',
        'Android',
        'iOS',
        '人工智能',
        '开发工具',
        '代码人生',
        '阅读',
      ];
      platformContent = (
        <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
          <Form.Item label="类别">
            <Select placeholder="点击选择类别" value={article.currentArticle.platforms ? article.currentArticle.platforms['juejin'].category : ''}
                    onChange={onChangePlatformConfig('juejin', 'category')}>
              {categories.map(category => (<Select.Option key={category}>{category}</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item label="标签">
            <Input placeholder="输入标签" value={article.currentArticle.platforms ? article.currentArticle.platforms['juejin'].tag : ''}/>
          </Form.Item>
        </Form>)
    }
  }

  return (
    <PageHeaderWrapper>
      <Modal title="发布文章" visible={article.pubModalVisible} onCancel={onPubModalCancel} width="600px" okText="发布"
             onOk={onPublish()}>
        <Table dataSource={article.currentArticle.tasks} columns={taskColumns} pagination={false}/>
      </Modal>
      <Modal title={article.currentPlatform ? article.currentPlatform.label : ''}
             visible={article.platformModalVisible}
             onCancel={onConfigCancel}>
        {platformContent}
      </Modal>
      <div className={style.actions}>
        <Button className={style.addBtn} type="primary" onClick={onNew}>创建文章</Button>
      </div>
      <Table dataSource={article.articles} columns={columns}/>
    </PageHeaderWrapper>
  );
};

export default connect(({article}: ConnectState) => ({
  article
}))(ArticleList);
