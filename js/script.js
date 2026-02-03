// declaraction of document.ready() function.
(function () {
    var ie = !!(window.attachEvent && !window.opera);
    var wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
    var fn = [];
    var run = function () {
        for (var i = 0; i < fn.length; i++) fn[i]();
    };
    var d = document;
    d.ready = function (f) {
        if (!ie && !wk && d.addEventListener)
            return d.addEventListener('DOMContentLoaded', f, false);
        if (fn.push(f) > 1) return;
        if (ie)
            (function () {
                try {
                    d.documentElement.doScroll('left');
                    run();
                } catch (err) {
                    setTimeout(arguments.callee, 0);
                }
            })();
        else if (wk)
            var t = setInterval(function () {
                if (/^(loaded|complete)$/.test(d.readyState))
                    clearInterval(t), run();
            }, 0);
    };
})();


document.ready(
    function () {
        // Remove theme toggle functionality
        // Keep only necessary initialization code
        var _Blog = window._Blog || {};
        
        // Remove theme-related code
        document.getElementsByTagName('body')[0].classList.remove('dark-theme');
        if (window.localStorage) {
            window.localStorage.removeItem('theme');
        }

        // Add copy buttons to code blocks
        initCodeCopyButtons();
    }
);

// Code block copy button functionality
function initCodeCopyButtons() {
    var codeBlocks = document.querySelectorAll('.post-content pre');
    
    codeBlocks.forEach(function(pre) {
        // Create copy button
        var copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        
        // Add click handler
        copyBtn.addEventListener('click', function() {
            var code = pre.querySelector('code');
            var text = code ? code.textContent : pre.textContent;
            
            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    showCopied(copyBtn);
                }).catch(function() {
                    fallbackCopy(text, copyBtn);
                });
            } else {
                fallbackCopy(text, copyBtn);
            }
        });
        
        // Add button to pre element
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
    });
}

// Show "Copied!" feedback
function showCopied(btn) {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    
    setTimeout(function() {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
    }, 2000);
}

// Fallback copy method for older browsers
function fallbackCopy(text, btn) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopied(btn);
    } catch (err) {
        btn.textContent = 'Failed';
        setTimeout(function() {
            btn.textContent = 'Copy';
        }, 2000);
    }
    
    document.body.removeChild(textarea);
}