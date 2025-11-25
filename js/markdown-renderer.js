/**
 * Markdown 渲染工具
 * 使用 marked + github-markdown-css + highlight.js
 * 
 * 使用方法：
 * 1. 在 HTML 中引入必要的 CSS 和 JS：
 *    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
 *    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
 *    <script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
 *    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
 *    <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
 * 
 * 2. 调用 renderMarkdown(markdownText, targetElement)
 */

(function() {
    'use strict';

    // 检查依赖
    if (typeof marked === 'undefined') {
        console.error('marked 未加载，请先引入 marked.js');
        return;
    }

    if (typeof hljs === 'undefined') {
        console.error('highlight.js 未加载，请先引入 highlight.js');
        return;
    }

    // 配置 marked
    marked.setOptions({
        breaks: true,        // 支持换行
        gfm: true,           // GitHub Flavored Markdown
        headerIds: true,     // 为标题添加 ID
        mangle: false,       // 不混淆邮箱地址
        pedantic: false,
        sanitize: false,     // 不使用内置的 sanitize（我们用 DOMPurify）
        smartLists: true,    // 智能列表
        smartypants: false,
        highlight: function(code, lang) {
            // 使用 highlight.js 高亮代码
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {
                    console.warn('代码高亮失败:', err);
                }
            }
            return hljs.highlightAuto(code).value;
        }
    });

    /**
     * 渲染 Markdown 到指定元素
     * @param {string} markdownText - Markdown 文本
     * @param {HTMLElement|string} targetElement - 目标元素或选择器
     * @param {Object} options - 配置选项
     * @param {boolean} options.sanitize - 是否进行安全过滤（默认 true）
     * @param {boolean} options.highlightCode - 是否高亮代码（默认 true）
     * @param {string} options.markdownClass - Markdown 容器的 class（默认 'markdown-body'）
     */
    window.renderMarkdown = function(markdownText, targetElement, options = {}) {
        const opts = {
            sanitize: typeof DOMPurify !== 'undefined',
            highlightCode: true,
            markdownClass: 'markdown-body',
            ...options
        };

        // 获取目标元素
        let target;
        if (typeof targetElement === 'string') {
            target = document.querySelector(targetElement);
        } else {
            target = targetElement;
        }

        if (!target) {
            console.error('目标元素不存在');
            return;
        }

        // 解析 Markdown
        let html = marked.parse(markdownText);

        // 安全过滤
        if (opts.sanitize && typeof DOMPurify !== 'undefined') {
            html = DOMPurify.sanitize(html, {
                ALLOWED_TAGS: [
                    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'strong', 'em', 'u', 's', 'code', 'pre',
                    'blockquote', 'ul', 'ol', 'li',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'a', 'img', 'hr', 'br', 'span', 'div',
                    'del', 'ins', 'sub', 'sup', 'kbd', 'mark'
                ],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height']
            });
        }

        // 添加 markdown-body class
        if (opts.markdownClass) {
            target.classList.add(opts.markdownClass);
        }

        // 插入 HTML
        target.innerHTML = html;

        // 高亮代码
        if (opts.highlightCode) {
            target.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    };

    /**
     * 从 URL 加载并渲染 Markdown
     * @param {string} url - Markdown 文件 URL
     * @param {HTMLElement|string} targetElement - 目标元素或选择器
     * @param {Object} options - 配置选项
     */
    window.loadAndRenderMarkdown = async function(url, targetElement, options = {}) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdownText = await response.text();
            window.renderMarkdown(markdownText, targetElement, options);
        } catch (error) {
            console.error('加载 Markdown 文件失败:', error);
            const target = typeof targetElement === 'string' 
                ? document.querySelector(targetElement) 
                : targetElement;
            if (target) {
                target.innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
            }
        }
    };

    // 自动渲染带有 data-markdown 属性的元素
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-markdown]').forEach(function(element) {
            const url = element.getAttribute('data-markdown');
            if (url) {
                window.loadAndRenderMarkdown(url, element);
            } else {
                const markdownText = element.textContent;
                element.textContent = ''; // 清空原始内容
                window.renderMarkdown(markdownText, element);
            }
        });
    });

})();

