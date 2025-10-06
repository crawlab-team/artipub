# Automation Workflow Specification

## Overview

This document describes the workflow specifications for automating article publishing across various platforms. Each workflow specification is an AI-readable description that can be converted into executable automation code.

## Workflow Structure

Each workflow specification contains:

1. **Platform Information**: Platform name, base URL, authentication requirements
2. **Workflow Steps**: Sequential steps to publish an article
3. **Selectors**: DOM selectors for UI elements
4. **Validation Rules**: Rules to verify successful execution
5. **Error Handling**: Strategies for common failure scenarios

## Example: Zhihu (知乎) Publishing Workflow

### Platform Information

- **Platform**: Zhihu (知乎)
- **Platform ID**: `zhihu`
- **Base URL**: `https://www.zhihu.com`
- **Editor URL**: `https://zhuanlan.zhihu.com/write`
- **Authentication**: Cookie-based
- **Content Format**: Markdown supported

### Workflow Steps

#### Step 1: Navigate to Editor
- Action: Navigate to editor URL
- URL: `https://zhuanlan.zhihu.com/write`
- Wait: Until editor is fully loaded
- Validation: Editor container is visible

#### Step 2: Input Article Title
- Action: Fill text input
- Selector: `input[placeholder*="标题"]` or `.WriteIndex-title textarea`
- Value: Article title
- Validation: Title appears in input field

#### Step 3: Input Article Content
- Action: Fill editor content
- Selector: `.public-DraftEditor-content` or `[contenteditable="true"]`
- Value: Article content (Markdown or rich text)
- Validation: Content appears in editor

#### Step 4: Add Footer
- Action: Append footer text
- Content: "本篇文章由一文多发平台 [ArtiPub](https://github.com/crawlab-team/artipub) 自动发布"
- Position: End of article content

#### Step 5: Publish Article
- Action: Click publish button
- Selector: `button:has-text("发布文章")` or `.PublishPanel-stepButton`
- Wait: For publish confirmation dialog
- Validation: Success message appears or URL changes

#### Step 6: Extract Published URL
- Action: Extract article URL from page
- Method: Read from browser URL or find link in success message
- Validation: URL matches pattern `https://zhuanlan.zhihu.com/p/[0-9]+`

### Selectors

```json
{
  "editor": {
    "container": ".WriteIndex-container",
    "title": "input[placeholder*='标题'], .WriteIndex-title textarea",
    "content": ".public-DraftEditor-content, [contenteditable='true']",
    "publishButton": "button:has-text('发布文章'), .PublishPanel-stepButton",
    "successMessage": ".notification-success, .Toast-message"
  }
}
```

### Error Handling

| Error Type | Detection | Recovery Strategy |
|------------|-----------|-------------------|
| Not logged in | Check for login button | Throw error - user must login first |
| Editor not loaded | Timeout waiting for editor | Refresh page and retry |
| Publish failed | Error message appears | Retry publish action up to 3 times |
| Network error | Request timeout | Wait and retry with exponential backoff |

### Validation Rules

1. **Pre-publish validation**
   - Title is not empty
   - Content is not empty
   - Editor is in ready state

2. **Post-publish validation**
   - Success message appears
   - Article URL is valid
   - URL is accessible (returns 200)

## Example: Juejin (掘金) Publishing Workflow

### Platform Information

- **Platform**: Juejin (掘金)
- **Platform ID**: `juejin`
- **Base URL**: `https://juejin.cn`
- **Editor URL**: `https://juejin.cn/editor/drafts/new`
- **Authentication**: Cookie-based
- **Content Format**: Markdown

### Workflow Steps

#### Step 1: Navigate to Editor
- Action: Navigate to editor URL
- URL: `https://juejin.cn/editor/drafts/new`
- Wait: Until editor is fully loaded

#### Step 2: Input Article Title
- Action: Fill text input
- Selector: `input[placeholder*="输入文章标题"]`
- Value: Article title

#### Step 3: Input Article Content
- Action: Fill markdown editor
- Selector: `.CodeMirror textarea` or `.bytemd-editor textarea`
- Value: Article content in Markdown format

#### Step 4: Add Footer
- Action: Append footer text
- Content: "\n\n> 本篇文章由一文多发平台 [ArtiPub](https://github.com/crawlab-team/artipub) 自动发布"

#### Step 5: Publish Article
- Action: Click publish button
- Selector: `button:has-text("发布")` or `.publish-button`
- Wait: For publish settings dialog

#### Step 6: Configure Publish Settings
- Action: Set article category and tags
- Selectors: Category dropdown, tag inputs
- Values: From article metadata

#### Step 7: Confirm Publish
- Action: Click confirm button in dialog
- Selector: `.dialog button:has-text("确定发布")`

#### Step 8: Extract Published URL
- Action: Extract article URL
- Method: Read from success message or redirect URL

### Selectors

```json
{
  "editor": {
    "title": "input[placeholder*='输入文章标题']",
    "content": ".CodeMirror textarea, .bytemd-editor textarea",
    "publishButton": "button:has-text('发布'), .publish-button",
    "categorySelect": ".category-select",
    "tagInput": ".tag-input",
    "confirmButton": ".dialog button:has-text('确定发布')"
  }
}
```

## Workflow Template

Use this template to create new workflow specifications:

```markdown
### Platform Information
- **Platform**: [Platform Name]
- **Platform ID**: [platform_id]
- **Base URL**: [https://platform.com]
- **Editor URL**: [https://platform.com/editor]
- **Authentication**: [Cookie-based / OAuth / API Key]
- **Content Format**: [Markdown / HTML / Rich Text]

### Workflow Steps

#### Step N: [Step Name]
- Action: [navigate / fill / click / wait / extract]
- Selector: [CSS selector or description]
- Value: [Input value or action parameter]
- Validation: [Expected result]

### Selectors
[JSON object with all selectors]

### Error Handling
[Table of error types and recovery strategies]

### Validation Rules
[List of validation rules]
```

## Notes for AI Code Generation

When generating automation code from these specifications:

1. **Extend BaseSpider class**: All platform spiders should extend the BaseSpider class
2. **Implement required methods**: `inputEditor()`, `inputContent()`, `afterPublish()`, etc.
3. **Use page.evaluate()**: For client-side JavaScript execution
4. **Add timeouts**: Include appropriate wait times between actions
5. **Handle errors gracefully**: Wrap actions in try-catch blocks
6. **Log actions**: Use logger for debugging and monitoring
7. **Follow existing patterns**: Study existing spider implementations (jianshu.ts, juejin.ts, etc.)

## Workflow Evolution

These specifications can evolve over time:

1. AI analyzes execution logs to identify failure patterns
2. AI proposes updates to selectors when UI changes are detected
3. AI suggests optimization to reduce execution time
4. AI generates new workflows by learning from existing patterns
