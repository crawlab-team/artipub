import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Popconfirm, Table} from "antd";
import {Article, ArticleModelState} from "@/models/article";
import {ConnectProps, ConnectState, Dispatch} from "@/models/connect";
import {connect} from "dva";
import {ColumnProps} from "antd/lib/table";
import router from "umi/router";

import style from './ArticleList.scss'
import moment from "moment";

export interface ArticleListProps extends ConnectProps {
  article: ArticleModelState;
  dispatch: Dispatch;
}

const ArticleList: React.FC<ArticleListProps> = props => {
  const {dispatch, article} = props;

  const onView: Function = (d: Article) => {
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
            <Button type="default" shape="circle" icon="edit" onClick={onView(d)}
                    style={{marginLeft: '10px', background: 'orange', color: 'white'}}/>
            <Popconfirm title="您确认删除该文章吗？" onConfirm={onDelete(d)}>
              <Button type="danger" shape="circle" icon="delete"
                      style={{marginLeft: '10px'}}/>
            </Popconfirm>
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
