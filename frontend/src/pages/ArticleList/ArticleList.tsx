import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Checkbox, Modal, Popconfirm, Table} from "antd";
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

  const onPublishPopup: Function = () => {
    return () => {
      if (dispatch) {
        dispatch({
          type: 'article/setPubModalVisible',
          payload: true,
        });
        dispatch({
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

  const onPublish: Function = (d: Platform) => {
    return (ev: any) => {
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

  const platformColumns: ColumnProps<any>[] = [
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
      title: '图标',
      key: 'icon',
      dataIndex: 'icon',
      width: '80px',
      render: (text, d) => {
        if (d.name === 'juejin') {
          return <img className={style.siteLogo} alt={d.label} src={imgJuejin}/>
        } else if (d.name === 'segmentfault') {
          return <img className={style.siteLogo} alt={d.label} src={imgSegmentfault}/>
        } else if (d.name === 'jianshu') {
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
      width: '180px'
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      render: (text, d) => {
        return (
          <div>
            <Button type="primary" shape="circle" icon="cloud" onClick={onPublish(d)}/>
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

  return (
    <PageHeaderWrapper>
      <Modal title="发布文章" visible={article.pubModalVisible} onCancel={onPubModalCancel}>
        <Table dataSource={article.platformList} columns={platformColumns} pagination={false}/>
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
