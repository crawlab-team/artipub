import React, {ChangeEventHandler, useEffect} from 'react';
// import {PageHeaderWrapper} from '@ant-design/pro-layout';
import BlankLayout from '@/layouts/BlankLayout';
// import UserLayout from '@/layouts/UserLayout';
import {ArticleModelState} from "@/models/article";
import {ConnectProps, ConnectState, Dispatch} from "@/models/connect";
import {connect} from "dva";
import {Button, Input, message} from "antd";
import {Controlled as CodeMirror} from 'react-codemirror2'
import {Editor, EditorChange, ScrollInfo} from "codemirror";
import showdown from 'showdown';

// 引入codemirror样式
import style from './ArticleEdit.scss';
import 'codemirror/mode/markdown/markdown';

showdown.setOption('tables', true);
showdown.setOption('tasklists', true);
showdown.setFlavor('github');

export interface ArticleEditProps extends ConnectProps {
  article: ArticleModelState;
  dispatch: Dispatch;
}

const ArticleEdit: React.FC<ArticleEditProps> = props => {
  const {dispatch, article} = props;

  useEffect(() => {
    if (dispatch) {
      const arr = location.pathname.split('/');
      dispatch({
        type: 'article/fetchArticle',
        payload: {
          id: arr[arr.length - 1]
        }
      });
    }
  }, []);

  // markdown to html转换器
  const converter = new showdown.Converter();

  const onTitleChange: ChangeEventHandler<HTMLInputElement> = ev => {
    if (dispatch) {
      dispatch({
        type: 'article/setArticleTitle',
        payload: {
          title: ev.target.value,
        }
      })
    }
  };

  // 更新预览HTML
  const updatePreview = () => {
    if (!article || !article.currentArticle) return;
    const $el = document.getElementById('content');
    if (!$el) return;
    $el.innerHTML = converter.makeHtml(article.currentArticle.content);
  };

  const onContentChange = (editor: Editor, data: EditorChange, value: string) => {
    if (dispatch) {
      dispatch({
        type: 'article/setArticleContent',
        payload: {
          content: value,
        }
      });
      setTimeout(() => {
        updatePreview();
      }, 0);
    }
  };

  // 调整CodeMirror高度
  setTimeout(() => {
    const $el = document.querySelector('.CodeMirror');
    if ($el) {
      $el.setAttribute('style', 'min-height:calc(100vh - 50px - 50px);box-shadow:none');
    }
  }, 100);

  // 首次渲染HTML
  setTimeout(() => {
    updatePreview();
  }, 100);

  // 监听左右侧上下滑动
  const onEditorScroll = (editor: Editor, scrollInfo: ScrollInfo) => {
    const $el = document.querySelector('#content') as HTMLDivElement;
    if (!$el) return;
    // if (scrollInfo.top >= scrollInfo.height - scrollInfo.clientHeight) {
    //   // $el.scrollTo(0, $el.scrollHeight);
    //   $el.scrollTo(0, Math.round(scrollInfo.top / scrollInfo.height * $el.scrollHeight));
    // } else {
    $el.scrollTo(0, Math.round(scrollInfo.top / scrollInfo.height * ($el.scrollHeight + $el.clientHeight)));
    // }
  };

  const onPreviewScroll = (ev: any) => {
    console.log(ev.target.scrollTop);
  };

  const onSave = () => {
    if (dispatch) {
      dispatch({
        type: 'article/saveCurrentArticle',
        payload: article.currentArticle,
      })
        .then(() => {
          message.success('文章保存成功');
        })
    }
  };

  return (
    <BlankLayout>
      {article.currentArticle ?
        (
          <div className={style.articleEdit}>
            {/*标题*/}
            <div className={style.topBar}>
              <Input
                className={style.title}
                placeholder="文章标题"
                value={article.currentArticle.title}
                onChange={onTitleChange}
              />
              <div className={style.actions}>
                <Button
                  className={style.backBtn}
                  type="default"
                >
                  返回
                </Button>
                <Button
                  className={style.saveBtn}
                  type="primary"
                  onClick={onSave}
                >
                  保存
                </Button>
              </div>
            </div>

            {/*主要内容*/}
            <div className={style.main}>
              {/*左侧Markdown编辑器*/}
              <div className={style.editor}>
                <CodeMirror
                  className={style.codeMirror}
                  value={article.currentArticle.content}
                  options={{
                    mode: 'markdown',
                    theme: 'eclipse',
                    lineNumbers: true,
                    smartIndent: true,
                    lineWrapping: true,
                  }}
                  onBeforeChange={onContentChange}
                  onScroll={onEditorScroll}
                />
                <div className={style.footer}>
                  <label style={{marginLeft: 20}}>Markdown编辑器</label>
                </div>
              </div>

              {/*右侧HTML预览*/}
              <div id="preview" className={style.preview}>
                <div className={style.contentWrapper}>
                  <article
                    id="content"
                    className={style.content}
                    onScroll={onPreviewScroll}
                  />
                  <div className={style.footer}>
                    <label style={{marginLeft: 20}}>预览</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        : 'NA'
      }
    </BlankLayout>
  );
};

export default connect(({article}: ConnectState) => ({
  article
}))(ArticleEdit);
