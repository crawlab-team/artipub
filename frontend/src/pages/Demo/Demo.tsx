import React from 'react';
import {Input} from "antd";
import {UnControlled as CodeMirror} from 'react-codemirror2'
import showdown from 'showdown';

// 引入样式
import style from './Demo.scss';

// 引入CodeMirror样式
import 'codemirror/mode/markdown/markdown';
import {Editor, EditorChange, ScrollInfo} from "codemirror";

showdown.setOption('tables', true);
showdown.setOption('tasklists', true);
showdown.setFlavor('github');

const Demo: React.FC = () => {
  // 调整CodeMirror高度
  setTimeout(() => {
    const $el = document.querySelector('.CodeMirror');
    if ($el) {
      $el.setAttribute('style', 'min-height:calc(100vh - 100px);box-shadow:none');
    }
  }, 100);

  // markdown to html转换器
  const converter = new showdown.Converter();

  // 内容变化回调
  const onContentChange = (editor: Editor, data: EditorChange, value: string) => {
    const $el = document.getElementById('content');
    if (!$el) return;
    $el.innerHTML = converter.makeHtml(value);
  };

  // 监听左右侧上下滑动
  const onEditorScroll = (editor: Editor, scrollInfo: ScrollInfo) => {
    const $el = document.querySelector('#content') as HTMLDivElement;
    if (!$el) return;
    $el.scrollTo(0, Math.round(scrollInfo.top / scrollInfo.height * ($el.scrollHeight + $el.clientHeight)));
  };

  return (
    <div className={style.articleEdit}>
      <div className={style.topBar}>
        <Input className={style.title} placeholder="请输入文章标题"/>
      </div>

      <div className={style.main}>
        <div className={style.editor}>
          <div className={style.markdown}>
            <CodeMirror
              className={style.codeMirror}
              options={{
                mode: 'markdown',
                theme: 'eclipse',
                lineNumbers: true,
                smartIndent: true,
                lineWrapping: true,
              }}
              onChange={onContentChange}
              onScroll={onEditorScroll}
            />
          </div>
          <div className={style.footer}>
            <label style={{marginLeft: 20}}>Markdown编辑器</label>
          </div>
        </div>

        <div id="preview" className={style.preview}>
          <div
            id="content"
            className={style.content}
          >
            <article
              id="content"
              className={style.content}
            />
          </div>
          <div className={style.footer}>
            <label style={{marginLeft: 20}}>预览</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
