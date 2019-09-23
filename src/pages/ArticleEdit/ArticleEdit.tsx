import React, {ChangeEventHandler, useEffect} from 'react';
// import {PageHeaderWrapper} from '@ant-design/pro-layout';
import BlankLayout from '@/layouts/BlankLayout';
// import UserLayout from '@/layouts/UserLayout';
import {ArticleModelState} from '@/models/article';
import {ConnectProps, ConnectState, Dispatch} from '@/models/connect';
import {connect} from 'dva';
import {Button, Input, message} from 'antd';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import MdEditor from "react-markdown-editor-lite";

// 引入codemirror样式
import style from './ArticleEdit.scss';
import 'codemirror/mode/markdown/markdown';
import {router} from 'umi';

export interface ArticleEditProps extends ConnectProps {
  article: ArticleModelState;
  dispatch: Dispatch;
}

const ArticleEdit: React.FC<ArticleEditProps> = props => {
  const {dispatch, article} = props;

  const isEdit = (): Boolean => {
    return (
      !!location.hash.match(/edit/) ||
      (!!article.currentArticle && !!article.currentArticle._id)
    );
  };

  useEffect(() => {
    if (dispatch) {
      if (isEdit()) {
        // 如果为编辑文章
        const arr = location.hash.split('/');
        dispatch({
          type: 'article/fetchArticle',
          payload: {
            id: arr[arr.length - 1],
          },
        });
      } else {
        // 如果为新增文章
      }
    }

    TDAPP.onEvent('文章编辑-访问页面');
  }, []);

  // 更新标题
  const onTitleChange: ChangeEventHandler<HTMLInputElement> = ev => {
    // console.log(article.currentArticle);
    // console.log(ev.target.value);
    if (dispatch) {
      dispatch({
        type: 'article/setArticleTitle',
        payload: {
          title: ev.target.value,
        },
      });
    }
  };

  // 更新内容
  const onContentChange = (data: any) => {
    const text = data.text;
    const html = data.html;
    if (dispatch) {
      dispatch({
        type: 'article/setArticleContent',
        payload: {
          content: text,
          contentHtml: html,
        },
      });
    }
  };

  const onImageUpload = (data: any) => {
    console.log(data);
  };

  // markdown to html转换器
  const mdParser = new MarkdownIt();

  // 调整CodeMirror高度
  setTimeout(() => {
    const $el = document.querySelector('.CodeMirror');
    if ($el) {
      $el.setAttribute('style', 'min-height:calc(100vh - 50px - 50px);box-shadow:none');
    }
  }, 100);

  // 点击保存
  const onSave = async () => {
    if (article.currentArticle) {
      // 文章标题校验
      if (article.currentArticle.title.length < 5) {
        message.error('标题字数不得小于5');
        return;
      }

      // 文章内容校验
      if (article.currentArticle.content.length < 10) {
        message.error('内容字数不得小于9');
        return;
      }
    }

    if (isEdit()) {
      // 如果为编辑文章
      await dispatch({
        type: 'article/saveCurrentArticle',
        payload: article.currentArticle,
      });
      message.success('文章保存成功');
    } else {
      // 如果为创建文章
      await dispatch({
        type: 'article/newArticle',
        payload: article.currentArticle,
      });
      message.success('文章保存成功');
    }

    TDAPP.onEvent('文章编辑-保存文章');
  };

  // 点击返回
  const onBack = () => {
    router.push('/articles');

    TDAPP.onEvent('文章编辑-返回');
  };

  return (
    <BlankLayout>
      <div className={style.articleEdit}>
        {/*标题*/}
        <div className={style.topBar}>
          <Input
            className={style.title}
            placeholder="文章标题"
            value={article.currentArticle ? article.currentArticle.title : ''}
            onChange={onTitleChange}
          />
          <div className={style.actions}>
            <Button className={style.backBtn} type="default" onClick={onBack}>
              返回
            </Button>
            <Button className={style.saveBtn} type="primary" onClick={onSave}>
              保存
            </Button>
          </div>
        </div>

        {/*主要内容*/}
        <div className={style.main}>
          <MdEditor
            style={{width: '100%', height: 'calc(100vh - 50px)'}}
            value={article.currentArticle ? article.currentArticle.content : ''}
            renderHTML={(text) => {
              const html = mdParser.render(text);
              dispatch({
                type: 'article/setArticleContentHtml',
                payload: {
                  contentHtml: html,
                },
              });
              return html;
            }}
            onChange={onContentChange}
            onImageUpload={onImageUpload}
          />
        </div>
      </div>
    </BlankLayout>
  );
};

export default connect(({article}: ConnectState) => ({
  article,
}))(ArticleEdit);
