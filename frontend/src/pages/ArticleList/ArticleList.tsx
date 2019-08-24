import React, {useEffect} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {Button, Table} from "antd";
import {Article, ArticleModelState} from "@/models/article";
import {ConnectProps, ConnectState, Dispatch} from "@/models/connect";
import {connect} from "dva";
import {ColumnProps} from "antd/lib/table";
import router from "umi/router";

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

  const columns: ColumnProps<any>[] = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      width: '90',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, d) => {
        return (
          <div>
            <Button type="primary" shape="circle" icon="search" onClick={onView(d)}/>
            <Button type="default" shape="circle" icon="edit"
                    style={{marginLeft: '10px', background: 'orange', color: 'white'}}/>
            <Button type="danger" shape="circle" icon="delete"
                    style={{marginLeft: '10px'}}/>
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
      <Table dataSource={article.articles} columns={columns}/>
    </PageHeaderWrapper>
  );
};

export default connect(({article}: ConnectState) => ({
  article
}))(ArticleList);
