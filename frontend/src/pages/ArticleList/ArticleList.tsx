import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {
  CloudOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Badge,
  Button,
  Card,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
  Popover,
} from 'antd';
import { Article, ArticleModelState } from "@/models/article";
import { ConnectState, Dispatch } from "@/models/connect";
import { ConnectProps } from 'umi';
import {connect, history} from 'umi';
import {ColumnProps} from 'antd/lib/table';
import style from './ArticleList.less';
import { Platform, PlatformModelState } from "@/models/platform";
import moment from 'moment';
import { Task, TaskModelState } from "@/models/task";
import constants from "@/constants";

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
import imgWechat from '@/assets/img/wechat-logo.jpg';
import imgAliyun from '@/assets/img/aliyun-logo.png';
import baiJiaHao from '@/assets/img/baijiahao-logo.png';
import devtoutiao from '@/assets/img/devtoutiao-logo.png';
import imgB51CTO from '@/assets/img/51CTO-logo.jpeg';
import juejin from "@/data/juejin";
import v2ex from "@/data/v2ex";

export interface ArticleListProps extends ConnectProps {
  task: TaskModelState;
  article: ArticleModelState;
  platform: PlatformModelState;
  dispatch: Dispatch;
  taskLoading: boolean;
}

const ArticleList: React.FC<ArticleListProps> = props => {
  const {dispatch, article, platform, task, taskLoading} = props;

  const onArticleEdit: Function = (d: Article) => {
    return () => {
      history.push(`/articles/edit/${d._id}`);

      TDAPP.onEvent('文章管理-点击编辑');
    };
  };

  const onArticleDelete: Function = (d: Article) => {
    return async () => {
      await dispatch({
        type: 'article/deleteArticle',
        payload: d,
      });
      await dispatch({
        type: 'article/fetchArticleList',
      });
      TDAPP.onEvent('文章管理-确认删除');
    };
  };

  const onArticleCreate = () => {
    if (dispatch) {
      dispatch({
        type: 'article/resetArticle',
      });
    }
    history.push('/articles/new');

    TDAPP.onEvent('文章管理-创建文章');
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

      // 持续请求更新状态
      const fetchHandle = await setInterval(() => {
        dispatch({
          type: 'task/fetchTaskList',
          payload: {
            id: a._id,
            updateStatus: true,
          },
        });
      }, 5000);
      await dispatch({
        type: 'article/setFetchHandle',
        payload: fetchHandle,
      });

      TDAPP.onEvent('文章管理-打开发布');
    };
  };

  const onArticleTasksModalCancel = async () => {
    await dispatch({
      type: 'article/setPubModalVisible',
      payload: false,
    });
    await dispatch({
      type: 'task/setTaskList',
      payload: [],
    });

    // 取消更新任务状态handle
    await clearInterval(article.fetchHandle);

    TDAPP.onEvent('文章管理-关闭发布');
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

      TDAPP.onEvent('文章管理-确认发布');
    };
  };

  const onTaskViewArticle: Function = (t: Task) => {
    return () => {
      window.open(t.url);

      TDAPP.onEvent('文章管理-查看文章原文');
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

        TDAPP.onEvent('文章管理-打开平台设置');
      }
    };
  };

  const onTaskModalCancel = () => {
    dispatch({
      type: 'article/setPlatformModalVisible',
      payload: false,
    });
    dispatch({
      type: 'task/saveCurrentTask',
      payload: undefined,
    });
    TDAPP.onEvent('文章管理-关闭平台设置');
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
    TDAPP.onEvent('文章管理-确认平台设置');
  };

  const getDefaultCategory = (p: Platform) => {
    if (p.name === constants.platform.JUEJIN) {
      return '前端';
    } else if (p.name === constants.platform.CSDN) {
      return '原创';
    } else {
      return '';
    }
  };

  const getDefaultTag = (p: Platform) => {
    if (p.name === constants.platform.JUEJIN) {
      return '前端';
    } else {
      return '前端';
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
          tag: getDefaultTag(p),
          title: article.currentArticle ? article.currentArticle.title : '',
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
      payload: {id: _article._id},
    });
  };

  const onTaskSelect = async (
    d: any,
    selected: boolean,
    selectedPlatforms: Object[],
    nativeEvent: Event,
  ) => {
    if (article.currentArticle) {
      console.log(selectedPlatforms)
      console.log(article.currentArticle)
      await saveTasks(selectedPlatforms, article.currentArticle);

      TDAPP.onEvent('文章管理-勾选平台');
    }
  };

  const onTaskSelectAll = async (selected: boolean, selectedPlatforms: Object[]) => {
    if (article.currentArticle) {
      await saveTasks(selectedPlatforms, article.currentArticle);

      TDAPP.onEvent('文章管理-勾选平台-全选');
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

  const getBadgeCount = (p: Platform) => {
    const t = task.tasks.filter((d: Task) => d.platformId === p._id)[0];
    if (!t || !t.checked) return 0;
    if (p.name === constants.platform.JUEJIN) {
      return t.tag === "" ? 1 : 0;
    } else if (p.name === constants.platform.SEGMENTFAULT) {
      return t.tag === "" ? 1 : 0;
    } else if (p.name === constants.platform.OSCHINA) {
      return t.category === "" ? 1 : 0;
    } else if (p.name === constants.platform.V2EX) {
      return t.category === "" ? 1 : 0;
    }
    return 0
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

      TDAPP.onEvent('文章管理-选择登陆类型');
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

  const taskRowSelection = {
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
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 'auto',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 'auto',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '数据统计',
      dataIndex: '_id',
      key: '_id',
      width: 'auto',
      render: (text: string, d: Article) => {
        return getStatsComponent(d);
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 'auto',
      render: (text, d) => {
        return (
          <div>
            <Tooltip title="发布">
              <Button
                type="primary"
                shape="circle"
                icon={<CloudOutlined />}
                className={style.pubBtn}
                onClick={onArticleTasksModalOpen(d)}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button
                type="default"
                shape="circle"
                icon={<EditOutlined />}
                className={style.editBtn}
                onClick={onArticleEdit(d)}
              />
            </Tooltip>
            <Popconfirm title="您确认删除该文章吗？" onConfirm={onArticleDelete(d)}>
              <Tooltip title="删除">
                <Button type="link" danger shape="circle" icon={<DeleteOutlined />} className={style.delBtn} />
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
        } else if (d.name === constants.platform.ZHIHU) {
          return <img className={style.siteLogo} alt={d.label} src={imgZhihu} />;
        } else if (d.name === constants.platform.OSCHINA) {
          return <img className={style.siteLogo} alt={d.label} src={imgOschina} />;
        } else if (d.name === constants.platform.B_51CTO) {
          return <img className={style.siteLogo} alt={d.label} src={imgB51CTO} />;
        } else if (d.name === constants.platform.TOUTIAO) {
          return (
            <div className={style.tipsWrapper} >
              <img className={style.siteLogo} alt={d.label} src={imgToutiao} />
              <Popover
                content={
                  <div className={style.tips} >
                      标题字符数区间[5,30];
                      正文要有图片;
                      正文不能包含非图片的外链
                  </div>
                }
                title={null}
                placement="rightTop"
                trigger="hover"
              >
                <QuestionCircleOutlined />
              </Popover>
            </div>
          );
        } else if (d.name === constants.platform.CNBLOGS) {
          return <img className={style.siteLogo} alt={d.label} src={imgCnblogs} />;
        } else if (d.name === constants.platform.V2EX) {
          return <img className={style.siteLogo} alt={d.label} src={imgV2ex} />;
        } else if (d.name === constants.platform.WECHAT) {
          return <img className={style.siteLogo} alt={d.label} src={imgWechat} />;
        } else if (d.name === constants.platform.ALIYUN) {
          return <img className={style.siteLogo} alt={d.label} src={imgAliyun} />;
        } else if (d.name === constants.platform.DEVTOUTIAO) {
          return <img className={style.siteLogo} alt={d.label} src={devtoutiao} />;
        } else if (d.name === constants.platform.BAIJIAHAO) {
          return (
            <div className={style.tipsWrapper} >
              <img className={style.siteLogo} alt={d.label} src={baiJiaHao} />
              <Popover
                content={
                  <div className={style.tips} >
                      只支持登陆验证;
                      需先实名认证;
                      每天最多发布5篇;
                      且文章正文有符合尺寸的图片
                  </div>
                }
                title={null}
                placement="rightTop"
                trigger="hover"
              >
                <QuestionCircleOutlined />
              </Popover>
            </div>
          );
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
              disabled={t.platform ? !t.platform.enableLogin : false}
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
                icon={<SearchOutlined />}
                className={style.viewBtn}
                onClick={onTaskViewArticle(t)}
              />
            </Tooltip>
            <Tooltip title="配置">
              <Badge count={getBadgeCount(p)}>
                <Button
                  disabled={t && !t.checked}
                  type="primary"
                  shape="circle"
                  icon={<ToolOutlined />}
                  className={style.configBtn}
                  onClick={onTaskModalOpen(p)}
                />
              </Badge>
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

    TDAPP.onEvent('文章管理-访问页面');
  }, []);

  // 平台配置
  let platformContent = <div></div>;
  const currentPlatform = platform.platforms
    ? platform.platforms.filter(
      (p: Platform) => !!task.currentTask && p._id === task.currentTask.platformId,
    )[0]
    : undefined;
  const currentTask = task.tasks.filter((t: Task) => t.platformId === (currentPlatform ? currentPlatform._id : ''))[0];
  let platformCommonContent = (
    <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
      <Form.Item label="标题">
        <Input
          value={currentTask ? currentTask.title : ''}
          placeholder="请输入标题（留空则用文章标题）"
          onChange={onTaskChange('input', 'title')}
        />
      </Form.Item>
    </Form>
  );
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
    const tags = juejin.tags.sort((a: string, b: string) => a > b ? 1 : -1);
    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="类别" required={true}>
          <Select
            placeholder="点击选择类别"
            value={task.currentTask ? task.currentTask.category : undefined}
            onChange={onTaskChange('select', 'category')}
          >
            {categories.map(category => (
              <Select.Option key={category} value={category}>{category}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="标签" required={true}>
          <Select
            placeholder="点击选择标签"
            value={task.currentTask ? task.currentTask.tag : undefined}
            onChange={onTaskChange('select', 'tag')}
            showSearch
            filterOption={(input: string, option: any) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {tags.map(tag => (
              <Select.Option key={tag} value={tag}>{tag}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.SEGMENTFAULT) {
    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="标签" required={true}>
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
      {value: '1', label: '原创'},
      {value: '2', label: '转载'},
      {value: '4', label: '翻译'},
    ];
    const pubTypes = [
      {value: 'public', label: '公开'},
      {value: 'private', label: '私密'},
      {value: 'needfans', label: '粉丝可见'},
      {value: 'needvip', label: 'VIP可见'},
    ];
    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="文章类型" required={true}>
          <Select
            placeholder="选择文章类型"
            value={task.currentTask ? task.currentTask.category : undefined}
            onChange={onTaskChange('select', 'category')}
          >
            {categories.map(c => (
              <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="发布形式" required={true}>
          <Select
            placeholder="选择发布形式"
            value={task.currentTask ? task.currentTask.pubType : undefined}
            onChange={onTaskChange('select', 'pubType')}
          >
            {pubTypes.map(pt => (
              <Select.Option key={pt.value} value={pt.value}>{pt.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.ZHIHU) {
    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="话题">
          <Input
            placeholder="输入话题（用逗号分割）"
            value={task.currentTask ? task.currentTask.tag : undefined}
            onChange={onTaskChange('input', 'tag')}
          />
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.B_51CTO) {
    //@ts-ignore
    const artiType = [
      {value: '1', label: '原创'},
      {value: '2', label: '转载'},
      {value: '3', label: '翻译'},
    ];
    //@ts-ignore
    const cate1 = [
      {value: '27', label: '系统/运维'},
      {value: '28', label: '云计算'},
      {value: '29', label: '大数据'},
      {value: '30', label: 'Web开发'},
      {value: '31', label: '编程语言'},
      {value: '32', label: '软件研发'},
      {value: '33', label: '考试认证'},
      {value: '34', label: '数据库'},
      {value: '35', label: '网络/安全'},
      {value: '36', label: '人工智能'},
      {value: '37', label: '移动开发'},
      {value: '38', label: '游戏开发'},
      {value: '39', label: '嵌入式'},
      {value: '40', label: '服务器'},
      {value: '41', label: '企业信息化'},
      {value: '42', label: 'Office办公'},
      {value: '43', label: '其他'},
    ];

    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="标签">
          <Input
            placeholder="最多设置5个，支持, 分隔"
            value={task.currentTask ? task.currentTask.tag : undefined}
            onChange={onTaskChange('input', 'tag')}
          />
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.OSCHINA) {
    const categories = [
      '移动开发',
      '前端开发',
      '人工智能',
      '服务端开发/管理',
      '游戏开发',
      '编程语言',
      '数据库',
      '企业开发',
      '图像/多媒体',
      '系统运维',
      '软件工程',
      '大数据',
      '云计算',
      '开源硬件',
      '区块链',
      '其他类型',
      '物联网',
    ];
    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="系统分类" required={true}>
          <Select
            placeholder="点击选择系统分类"
            value={task.currentTask ? task.currentTask.category : undefined}
            onChange={onTaskChange('select', 'category')}
          >
            {categories.map(category => (
              <Select.Option key={category} value={category}>{category}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    );
  } else if (currentPlatform && currentPlatform.name === constants.platform.V2EX) {
    const categories = v2ex.categories;
    platformContent = (
      <Form labelCol={{sm: {span: 4}}} wrapperCol={{sm: {span: 20}}}>
        <Form.Item label="节点" required={true}>
          <Select
            placeholder="点击选择节点"
            value={task.currentTask ? task.currentTask.category : undefined}
            onChange={onTaskChange('select', 'category')}
            showSearch
            filterOption={(input: string, option: any) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {categories.map(category => (
              <Select.Option key={category.value} value={category.value}>{category.label}</Select.Option>
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
          loading={taskLoading}
          pagination={false}
        />
      </Modal>
      <Modal
        title={currentPlatform ? '配置-' + currentPlatform.label : '配置'}
        visible={article.platformModalVisible}
        onOk={onTaskModalConfirm}
        onCancel={onTaskModalCancel}
      >
        {platformCommonContent}
        {platformContent}
      </Modal>
      <div className={style.actions}>
        <Button className={style.addBtn} type="primary" onClick={onArticleCreate}>
          创建文章
        </Button>
      </div>
      <Card>
        <Table dataSource={article.articles} columns={articleColumns} rowKey={record => record._id}/>
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(
  ({ article, platform, task, loading }: ConnectState) => ({
    article,
    platform,
    task,
    taskLoading: loading.effects["task/fetchTaskList"],
  })
)(ArticleList);
