import React, { useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Table, Tag, Tooltip } from 'antd';
import { Article, ArticleModelState } from '@/models/article';
import { ConnectProps, ConnectState, Dispatch } from '@/models/connect';
import { connect } from 'dva';
import { ColumnProps, SelectionSelectFn, TableRowSelection } from 'antd/lib/table';
import router from 'umi/router';
import style from './ArticleList.scss';
import { Platform, PlatformModelState } from '@/models/platform';
import moment from 'moment';
import { Task, TaskModelState } from '@/models/task';
import constants from '@/constants';

// logo images
import imgJuejin from '@/assets/img/juejin-logo.svg';
import imgSegmentfault from '@/assets/img/segmentfault-logo.jpg';
import imgJianshu from '@/assets/img/jianshu-logo.png';
import imgCsdn from '@/assets/img/csdn-logo.jpg';

export interface ArticleListProps extends ConnectProps {
  task: TaskModelState;
  article: ArticleModelState;
  platform: PlatformModelState;
  dispatch: Dispatch;
}

const ArticleList: React.FC<ArticleListProps> = props => {
  const { dispatch, article, platform, task } = props;

  const onArticleEdit: Function = (d: Article) => {
    return () => {
      router.push(`/articles/edit/${d._id}`);
    };
  };

  const onArticleDelete: Function = (d: Article) => {
    return () => {
      if (dispatch) {
        dispatch({
          type: 'article/deleteArticle',
          payload: d,
        }).then(() => {
          dispatch({
            type: 'article/fetchArticleList',
          });
        });
      }
    };
  };

  const onArticleCreate = () => {
    if (dispatch) {
      dispatch({
        type: 'article/resetArticle',
      });
    }
    router.push('/articles/new');
  };

  const onArticleTasksModalOpen: Function = (a: Article) => {
    return async () => {
      await dispatch({
        type: 'article/fetchArticle',
        payload: {
          id: a._id,
        },
      });
      await dispatch({
        type: 'article/setPubModalVisible',
        payload: true,
      });
      await dispatch({
        type: 'task/fetchTaskList',
        payload: {
          id: a._id,
        },
      });
    };
  };

  const onArticleTasksModalCancel = async () => {
    if (dispatch) {
      await dispatch({
        type: 'article/setPubModalVisible',
        payload: false,
      });
      await dispatch({
        type: 'task/setTaskList',
        payload: [],
      });
    }
  };

  const onArticleTasksPublish: Function = () => {
    return async () => {
      if (article.currentArticle) {
        await dispatch({
          type: 'article/publishArticle',
          payload: {
            id: article.currentArticle._id,
          },
        });
        message.success('已开始发布');
      }
    };
  };

  const onTaskViewArticle: Function = (t: Task) => {
    return () => {
      window.open(t.url);
    };
  };

  const onTaskModalOpen: Function = (p: Platform) => {
    return () => {
      if (article.currentArticle) {
        const t: Task = task.tasks.filter((t: Task) => t.platformId === p._id)[0];
        dispatch({
          type: 'task/saveCurrentTask',
          payload: t,
        });
        dispatch({
          type: 'article/setPlatformModalVisible',
          payload: true,
        });
      }
    };
  };

  const onTaskModalCancel = () => {
    dispatch({
      type: 'article/setPlatformModalVisible',
      payload: false,
    });
  };

  const onTaskModalConfirm = () => {
    dispatch({
      type: 'task/addTasks',
      payload: task.tasks,
    });
    dispatch({
      type: 'article/setPlatformModalVisible',
      payload: false,
    });
  };

  const getDefaultCategory = (p: Platform) => {
    if (p.name === constants.platform.JUEJIN) {
      return '前端';
    } else if (p.name === constants.platform.CSDN) {
      return '1'; // 原创
    } else {
      return '';
    }
  };

  const saveTasks = async (selectedPlatforms: Object[], _article: Article) => {
    if (!platform.platforms) return;
    let tasks: Task[] = [];
    platform.platforms.forEach((p: Platform) => {
      let t: Task = task.tasks.filter((_t: Task) => _t.platformId === p._id)[0];
      if (t) {
        t.checked = selectedPlatforms.map((p: any) => p._id || '').includes(t.platformId);
      } else {
        t = {
          platformId: p._id || '',
          articleId: _article._id || '',
          category: getDefaultCategory(p),
          tag: '',
          pubType: 'public',
          checked: selectedPlatforms.map((_p: any) => _p._id).includes(p._id),
          authType: constants.authType.COOKIE,
          url: '',
        };
      }
      tasks.push(t);
    });
    await dispatch({
      type: 'task/setTaskList',
      payload: tasks,
    });
    await dispatch({
      type: 'task/addTasks',
      payload: tasks,
    });
    await dispatch({
      type: 'task/fetchTaskList',
      payload: { id: _article._id },
    });
  };

  const onTaskSelect: SelectionSelectFn<any> = async (
    d: any,
    selected: boolean,
    selectedPlatforms: Object[],
    nativeEvent: Event,
  ) => {
    if (article.currentArticle) {
      await saveTasks(selectedPlatforms, article.currentArticle);
    }
  };

  const onTaskSelectAll = async (selected: boolean, selectedPlatforms: Object[]) => {
    if (article.currentArticle) {
      await saveTasks(selectedPlatforms, article.currentArticle);
    }
  };

  const onTaskChange: Function = (type: string, key: string) => {
    return (ev: any) => {
      let value;
      if (type === constants.inputType.SELECT) {
        value = ev;
      } else if (type === constants.inputType.INPUT) {
        value = ev.target.value;
      }
      if (value !== undefined && !!task.currentTask) {
        task.currentTask[key] = value;
        dispatch({
          type: 'task/saveCurrentTask',
          payload: task.currentTask,
        });
      }
    };
  };

  /**
   * 选择验证方式
   * 假设已经获取task.tasks
   * @param t
   * @param authType
   */
  const onSelectAuthType: Function = (t: Task, authType: string) => {
    return async () => {
      const tasks = task.tasks.map((_t: Task) => {
        if (t === _t) {
          _t.authType = authType;
        }
        return _t;
      });
      await dispatch({
        type: 'task/saveTaskList',
        payload: tasks,
      });
      await dispatch({
        type: 'task/addTasks',
        payload: tasks,
      });
    };
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

  const taskRowSelection: TableRowSelection<any> = {
    selectedRowKeys: task.tasks.filter((d: Task) => d.checked).map((d: Task) => d.platformId),
    onSelect: onTaskSelect,
    onSelectAll: onTaskSelectAll,
  };

  const articleColumns: ColumnProps<any>[] = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      width: 'auto',
    },
    {
      title: '创建时间',
      dataIndex: 'createTs',
      key: 'createTs',
      width: '180px',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTs',
      key: 'updateTs',
      width: '180px',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '数据统计',
      dataIndex: '_id',
      key: '_id',
      width: '200px',
      render: (text: string, d: Article) => {
        return getStatsComponent(d);
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: '200px',
      render: (text, d) => {
        return (
          <div>
            <Tooltip title="发布">
              <Button
                type="primary"
                shape="circle"
                icon="cloud"
                className={style.pubBtn}
                onClick={onArticleTasksModalOpen(d)}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button
                type="default"
                shape="circle"
                icon="edit"
                className={style.editBtn}
                onClick={onArticleEdit(d)}
              />
            </Tooltip>
            <Popconfirm title="您确认删除该文章吗？" onConfirm={onArticleDelete(d)}>
              <Tooltip title="删除">
                <Button type="danger" shape="circle" icon="delete" className={style.delBtn} />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const taskColumns: ColumnProps<any>[] = [
    {
      title: '平台',
      key: 'icon',
      dataIndex: 'icon',
      width: '80px',
      render: (text, d) => {
        if (d.name === constants.platform.JUEJIN) {
          return <img className={style.siteLogo} alt={d.label} src={imgJuejin} />;
        } else if (d.name === constants.platform.SEGMENTFAULT) {
          return <img className={style.siteLogo} alt={d.label} src={imgSegmentfault} />;
        } else if (d.name === constants.platform.JIANSHU) {
          return <img className={style.siteLogo} alt={d.label} src={imgJianshu} />;
        } else if (d.name === constants.platform.CSDN) {
          return <img className={style.siteLogo} alt={d.label} src={imgCsdn} />;
        } else {
          return <div />;
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
      render: (text: string, p: Platform) => {
        const t: Task = task.tasks.filter((t: Task) => t.platformId === p._id)[0];
        if (!t) return <div />;
        let el;
        if (t.status === constants.status.NOT_STARTED) {
          el = <Tag color="grey">未发布</Tag>;
        } else if (t.status === constants.status.PROCESSING) {
          el = <Tag color="orange">正在发布</Tag>;
        } else if (t.status === constants.status.ERROR) {
          el = (
            <Tooltip title={t.error}>
              <Tag color="red">错误</Tag>
            </Tooltip>
          );
        } else if (t.status === constants.status.FINISHED) {
          el = <Tag color="green">已发布</Tag>;
        } else {
          el = <Tag color="grey">未发布</Tag>;
        }
        return el;
      },
    },
    {
      title: '验证方式',
      dataIndex: '_id',
      width: '150px',
      render: (text: string, p: Platform) => {
        const t: Task = task.tasks.filter((t: Task) => t.platformId === p._id)[0];
        if (!t) return <div />;
        return (
          <Button.Group>
            <Button
              type={t.authType === constants.authType.LOGIN ? 'primary' : 'default'}
              size="small"
              onClick={onSelectAuthType(t, constants.authType.LOGIN)}
            >
              登陆
            </Button>
            <Button
              type={t.authType === constants.authType.COOKIE ? 'primary' : 'default'}
              size="small"
              onClick={onSelectAuthType(t, constants.authType.COOKIE)}
            >
              Cookie
            </Button>
          </Button.Group>
        );
      },
    },
    {
      title: '数据统计',
      dataIndex: 'key',
      key: 'key',
      width: '200px',
      render: (text: string, p: Platform) => {
        const t: Task = task.tasks.filter((t: Task) => t.platformId === p._id)[0];
        if (!t) return <div />;
        return getStatsComponent(t);
      },
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: '120px',
      render: (text: string, p: Platform) => {
        const t: Task = task.tasks.filter((t: Task) => t.platformId === p._id)[0];
        if (!t) return <div />;
        return (
          <div>
            <Tooltip title="查看文章">
              <Button
                disabled={!t.url}
                type="default"
                shape="circle"
                icon="search"
                className={style.viewBtn}
                onClick={onTaskViewArticle(t)}
              />
            </Tooltip>
            <Tooltip title="配置">
              <Button
                disabled={t && !t.checked}
                type="primary"
                shape="circle"
                icon="tool"
                className={style.configBtn}
                onClick={onTaskModalOpen(p)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'article/fetchArticleList',
      });
      dispatch({
        type: 'platform/fetchPlatformList',
      });
    }
  }, []);

  // 平台配置
  let platformContent = <div></div>;
  const currentPlatform = platform.platforms
    ? platform.platforms.filter(
        (p: Platform) => !!task.currentTask && p._id === task.currentTask.platformId,
      )[0]
    : undefined;
  if (currentPlatform && currentPlatform.name === constants.platform.JUEJIN) {
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
      <Form labelCol={{ sm: { span: 4 } }} wrapperCol={{ sm: { span: 20 } }}>
        <Form.Item label="类别">
          <Select
            placeholder="点击选择类别"
            value={task.currentTask ? task.currentTask.category : undefined}
            onChange={onTaskChange('select', 'category')}
          >
            {categories.map(category => (
              <Select.Option key={category}>{category}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="标签">
          <Input
            placeholder="输入标签"
            value={task.currentTask ? task.currentTask.tag : undefined}
            onChange={onTaskChange('input', 'tag')}
          />
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.SEGMENTFAULT) {
    platformContent = (
      <Form labelCol={{ sm: { span: 4 } }} wrapperCol={{ sm: { span: 20 } }}>
        <Form.Item label="标签">
          <Input
            placeholder="输入标签（用逗号分割）"
            value={task.currentTask ? task.currentTask.tag : undefined}
            onChange={onTaskChange('input', 'tag')}
          />
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.JIANSHU) {
  } else if (currentPlatform && currentPlatform.name === constants.platform.CSDN) {
    const categories = [
      { value: '1', label: '原创' },
      { value: '2', label: '转载' },
      { value: '4', label: '翻译' },
    ];
    const pubTypes = [
      { value: 'public', label: '公开' },
      { value: 'private', label: '私密' },
      { value: 'needfans', label: '粉丝可见' },
      { value: 'needvip', label: 'VIP可见' },
    ];
    platformContent = (
      <Form labelCol={{ sm: { span: 4 } }} wrapperCol={{ sm: { span: 20 } }}>
        <Form.Item label="文章类型">
          <Select
            placeholder="选择文章类型"
            value={task.currentTask ? task.currentTask.category : undefined}
            onChange={onTaskChange('select', 'category')}
          >
            {categories.map(c => (
              <Select.Option key={c.value}>{c.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="发布形式">
          <Select
            placeholder="选择发布形式"
            value={task.currentTask ? task.currentTask.pubType : undefined}
            onChange={onTaskChange('select', 'pubType')}
          >
            {pubTypes.map(pt => (
              <Select.Option key={pt.value}>{pt.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    );
  }

  return (
    <PageHeaderWrapper>
      <Modal
        title="发布文章"
        visible={article.pubModalVisible}
        onCancel={onArticleTasksModalCancel}
        width="1000px"
        okText="发布"
        onOk={onArticleTasksPublish()}
      >
        <Table
          dataSource={
            platform.platforms
              ? platform.platforms.map((d: Platform) => {
                  return {
                    key: d._id,
                    ...d,
                  };
                })
              : []
          }
          rowSelection={taskRowSelection}
          columns={taskColumns}
          pagination={false}
        />
      </Modal>
      <Modal
        title={currentPlatform ? '配置-' + currentPlatform.label : '配置'}
        visible={article.platformModalVisible}
        onOk={onTaskModalConfirm}
        onCancel={onTaskModalCancel}
      >
        {platformContent}
      </Modal>
      <div className={style.actions}>
        <Button className={style.addBtn} type="primary" onClick={onArticleCreate}>
          创建文章
        </Button>
      </div>
      <Table dataSource={article.articles} columns={articleColumns} />
      <textarea id="paste-area" style={{ display: 'none' }} />
    </PageHeaderWrapper>
  );
};

export default connect(({ article, platform, task }: ConnectState) => ({
  article,
  platform,
  task,
}))(ArticleList);
