# Markdown 渲染库推荐与集成指南

## 推荐的库组合

### 方案一：marked + github-markdown-css + highlight.js（推荐）
**优点**：轻量级、快速、GitHub 风格、代码高亮

### 方案二：markdown-it + github-markdown-css + Prism.js
**优点**：功能强大、插件丰富、代码高亮效果好

### 方案三：marked + github-markdown-css + KaTeX（如果文章有数学公式）
**优点**：支持数学公式渲染

## CDN 链接

### 方案一（推荐）
```html
<!-- Markdown 解析器 -->
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>

<!-- GitHub Markdown 样式 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">

<!-- 代码高亮 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

<!-- 可选：安全过滤 -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

### 方案二（功能更强大）
```html
<!-- Markdown 解析器 -->
<script src="https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js"></script>

<!-- GitHub Markdown 样式 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">

<!-- 代码高亮 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
```

## 使用示例

### 基础用法（marked）
```javascript
// 配置 marked
marked.setOptions({
  breaks: true,        // 支持换行
  gfm: true,           // GitHub Flavored Markdown
  headerIds: true,     // 为标题添加 ID
  mangle: false,       // 不混淆邮箱地址
  pedantic: false,     // 不启用原始 markdown.pl 的怪异行为
  sanitize: false,     // 不使用 DOMPurify（如果用了 DOMPurify，设为 false）
  smartLists: true,    // 智能列表
  smartypants: false   // 智能标点
});

// 渲染 Markdown
const markdownText = `# Hello World\n\nThis is **bold** text.`;
const html = marked.parse(markdownText);

// 安全过滤（可选）
const cleanHtml = DOMPurify.sanitize(html);

// 插入到页面
document.getElementById('content').innerHTML = cleanHtml;

// 高亮代码块
hljs.highlightAll();
```

### 高级用法（markdown-it）
```javascript
// 创建 markdown-it 实例
const md = window.markdownit({
  html: true,          // 允许 HTML 标签
  linkify: true,       // 自动转换 URL 为链接
  typographer: true,   // 启用一些语言中性的替换 + 引号美化
  breaks: true,        // 转换 '\n' 为 <br>
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// 渲染
const html = md.render(markdownText);
document.getElementById('content').innerHTML = html;
```

## 样式定制

### GitHub Markdown CSS 主题
GitHub Markdown CSS 支持多种主题：
- `github-markdown.css` - 默认（浅色）
- `github-markdown-dark.css` - 暗色主题
- `github-markdown-light.css` - 浅色主题

### 自定义样式
```css
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}
```

## 完整集成示例

查看 `examples/markdown-renderer.html` 获取完整示例。

