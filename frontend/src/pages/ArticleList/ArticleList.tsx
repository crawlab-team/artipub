import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Form, Input, message, Modal, Popconfirm, Select, Table, Tag, Tooltip} from "antd";
import {Article, ArticleModelState} from "@/models/article";
import {ConnectProps, ConnectState, Dispatch} from "@/models/connect";
import {connect} from "dva";
import {ColumnProps, SelectionSelectFn, TableRowSelection} from "antd/lib/table";
import router from "umi/router";
import style from './ArticleList.scss';
import {Platform, PlatformModelState} from "@/models/platform";
import moment from "moment";
import {Task, TaskModelState} from "@/models/task";
import constants from "@/constants";

// logo images
import imgJuejin from '@/assets/img/juejin-logo.svg';
import imgSegmentfault from '@/assets/img/segmentfault-logo.jpg';
import imgJianshu from '@/assets/img/jianshu-logo.png';

export interface ArticleListProps extends ConnectProps {
  task: TaskModelState;
  article: ArticleModelState;
  platform: PlatformModelState;
  dispatch: Dispatch;
}

const ArticleList: React.FC<ArticleListProps> = props => {
  const {dispatch, article, platform, task} = props;

  const onArticleEdit: Function = (d: Article) => {
    return () => {
      router.push(`/articles/edit/${d._id}`);
    }
  };

  const onArticleDelete: Function = (d: Article) => {
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

  const onArticleCreate = () => {
    if (dispatch) {
      dispatch({
        type: 'article/resetArticle',
      });
    }
    router.push('/articles/new')
  };

  const onArticleTasksModalOpen: Function = (a: Article) => {
    return async () => {
      await dispatch({
        type: 'article/fetchArticle',
        payload: {
          id: a._id
        }
      });
      await dispatch({
        type: 'article/setPubModalVisible',
        payload: true,
      });
      await dispatch({
        type: 'task/fetchTaskList',
        payload: {
          id: a._id,
        }
      });
    }
  };

  const onArticleTasksModalCancel = () => {
    if (dispatch) {
      dispatch({
        type: 'article/setPubModalVisible',
        payload: false,
      })
    }
  };

  const onArticleTasksPublish: Function = () => {
    return async () => {
      if (article.currentArticle) {
        await dispatch({
          type: 'article/publishArticle',
          payload: {
            id: article.currentArticle._id,
          }
        });
        message.success('已开始发布')
      }
    }
  };

  const onTaskViewArticle: Function = (d: any) => {
    return () => {
      if (article.currentArticle) {
        window.open(article.currentArticle[d.name].url);
      }
    }
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

  const saveTasks = (selectedPlatforms: Object[]) => {
    let tasks;
    if (task.tasks.length) {
      tasks = task.tasks.map((t: Task) => {
        t.checked = selectedPlatforms.map((p: any) => p._id).includes(t.platformId);
        return t;
      });
    } else {
      tasks = platform.platforms.map((p: Platform): Task => {
        return {
          platformId: p._id || '',
          articleId: article.currentArticle ? (article.currentArticle._id || '') : '',
          category: '',
          tag: '',
          checked: selectedPlatforms.map((_p: any) => _p._id).includes(p._id),
        }
      });
    }
    dispatch({
      type: 'task/saveTaskList',
      payload: tasks,
    });
    dispatch({
      type: 'task/addTasks',
      payload: tasks,
    });
  };

  const onTaskSelect: SelectionSelectFn<any> = (d: any, selected: boolean, selectedPlatforms: Object[], nativeEvent: Event) => {
    saveTasks(selectedPlatforms);
  };

  const onTaskSelectAll = (selected: boolean, selectedPlatforms: Object[]) => {
    saveTasks(selectedPlatforms);
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

  const platformRowSelection: TableRowSelection<any> = {
    selectedRowKeys: task.tasks
      .filter((d: Task) => d.checked)
      .map((d: Task) => d.platformId),
    onSelect: onTaskSelect,
    onSelectAll: onTaskSelectAll,
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
            <Tooltip title="发布">
              <Button type="primary" shape="circle" icon="cloud" className={style.pubBtn}
                      onClick={onArticleTasksModalOpen(d)}/>
            </Tooltip>
            <Tooltip title="编辑">
              <Button type="default" shape="circle" icon="edit" className={style.editBtn} onClick={onArticleEdit(d)}/>
            </Tooltip>
            <Popconfirm title="您确认删除该文章吗？" onConfirm={onArticleDelete(d)}>
              <Tooltip title="删除">
                <Button type="danger" shape="circle" icon="delete" className={style.delBtn}/>
              </Tooltip>
            </Popconfirm>
          </div>
        )
      }
    }
  ];

  const platformColumns: ColumnProps<any>[] = [
    {
      title: '平台',
      key: 'icon',
      dataIndex: 'icon',
      width: '80px',
      render: (text, d) => {
        if (d.name === constants.platform.JUEJIN) {
          return <img className={style.siteLogo} alt={d.label} src={imgJuejin}/>
        } else if (d.name === constants.platform.SEGMENTFAULT) {
          return <img className={style.siteLogo} alt={d.label} src={imgSegmentfault}/>
        } else if (d.name === constants.platform.JIANSHU) {
          return <img className={style.siteLogo} alt={d.label} src={imgJianshu}/>
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
      render: (text: string, p: Platform) => {
        const t: Task = task.tasks.filter((t: Task) => t.platformId === p._id)[0];
        if (!t) return <div/>;
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
        }
        return el
      }
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: '120px',
      render: (text: string, p: Platform) => {
        let isFinished = false;
        if (article.currentArticle && article.currentArticle[p.name] && article.currentArticle[p.name].url) {
          isFinished = true;
        }
        const t: Task = task.tasks.filter((t: Task) => t.platformId === p._id)[0];
        return (
          <div>
            <Tooltip title="查看文章">
              <Button disabled={!isFinished} type="default" shape="circle" icon="search"
                      className={style.viewBtn} onClick={onTaskViewArticle(p)}/>
            </Tooltip>
            <Tooltip title="配置">
              <Button disabled={t && !t.checked} type="primary" shape="circle" icon="tool"
                      className={style.configBtn} onClick={onTaskModalOpen(p)}/>
            </Tooltip>
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
      dispatch({
        type: 'platform/fetchPlatformList',
      });
    }
  }, []);

  // 平台配置
  let platformContent = <div></div>;
  const currentPlatform = platform.platforms.filter((p: Platform) => !!task.currentTask && p._id === task.currentTask.platformId)[0];
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
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="类别">
          <Select placeholder="点击选择类别" value={task.currentTask ? task.currentTask.category : undefined}
                  onChange={onTaskChange('select', 'category')}>
            {categories.map(category => (<Select.Option key={category}>{category}</Select.Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="标签">
          <Input placeholder="输入标签" value={task.currentTask ? task.currentTask.tag : undefined}
                 onChange={onTaskChange('input', 'tag')}/>
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.SEGMENTFAULT) {
    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="标签">
          <Input placeholder="输入标签（用逗号分割）"
                 value={task.currentTask ? task.currentTask.tag : undefined}
                 onChange={onTaskChange('input', 'tag')}/>
        </Form.Item>
      </Form>
    );
  }

  return (
    <PageHeaderWrapper>
      <Modal title="发布文章" visible={article.pubModalVisible} onCancel={onArticleTasksModalCancel} width="600px"
             okText="发布"
             onOk={onArticleTasksPublish()}>
        <Table dataSource={platform.platforms ? platform.platforms.map((d: Platform) => {
          return {
            key: d._id,
            ...d
          }
        }) : []}
               rowSelection={platformRowSelection}
               columns={platformColumns}
               pagination={false}/>
      </Modal>
      <Modal title={currentPlatform ? '配置-' + currentPlatform.label : '配置'}
             visible={article.platformModalVisible}
             onOk={onTaskModalConfirm}
             onCancel={onTaskModalCancel}>
        {platformContent}
      </Modal>
      <div className={style.actions}>
        <Button className={style.addBtn} type="primary" onClick={onArticleCreate}>创建文章</Button>
      </div>
      <Table dataSource={article.articles} columns={columns}/>
    </PageHeaderWrapper>
  );
};

export default connect(({article, platform, task}: ConnectState) => ({
  article,
  platform,
  task
}))(ArticleList);
