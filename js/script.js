(function () {
  "use strict";

  var LANGUAGE_KEY = "curtis-site-language";
  var validLanguages = ["en", "zh"];
  var articleTranslations = {
    "/archives/2026/02/": {
      title: "When an Agent Learns to Cut Corners",
      summary: "A debugging record of a Tool Calling failure caused by conversational memory, with the investigation path and architectural fixes that finally resolved it."
    },
    "/archives/2026/01/": {
      title: "Agents and Tool Calling through smolagents",
      summary: "A practical look at agents as a spectrum, how tool descriptions and parsers shape behavior, and why error handling belongs in the design from day one."
    },
    "/archives/2025/11/": {
      title: "Maintainability in Customer-Service Agents",
      summary: "Notes on prompt debt, semantic routing, dynamic policy retrieval, and moving from prompt engineering toward context engineering."
    },
    "/archives/2025/07/": {
      title: "Engineering Agents through Tool Calling",
      summary: "An implementation-oriented explanation of the mechanics behind Tool Calling and the decisions that make an agent reliable in production."
    },
    "/archives/2025/06/": {
      title: "Games I Have Played",
      summary: "A personal archive of memorable games, mechanics, and the experiences that stayed after the screen went dark."
    },
    "/archives/2025/05/": {
      title: "Product Design and User Experience",
      summary: "A reflection on product design as an experience shaped by clarity, feedback, emotion, and the small decisions users can feel."
    },
    "/archives/2024/12/": {
      title: "My Music Collection",
      summary: "The stories behind a personal Go Fav playlist and the moments, places, and feelings attached to the tracks."
    }
  };

  function getStoredLanguage() {
    try {
      var stored = window.localStorage.getItem(LANGUAGE_KEY);
      if (validLanguages.indexOf(stored) !== -1) return stored;
    } catch (error) {
      return "en";
    }
    return "en";
  }

  function getActivePage() {
    var declared = document.body && document.body.dataset.page;
    if (declared) return declared;
    var path = window.location.pathname;
    if (path === "/" || path.endsWith("/index.html") && path.split("/").length <= 3) return "home";
    if (path.indexOf("/products") === 0) return "work";
    if (path.indexOf("/archives") === 0) return "notes";
    if (path.indexOf("/about") === 0) return window.location.hash === "#contact" ? "contact" : "about";
    return "";
  }

  function bilingual(en, zh) {
    return '<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + "</span>";
  }

  function languageSwitchMarkup(extraClass) {
    return (
      '<div class="language-switch ' + (extraClass || "") + '" role="group" aria-label="Language">' +
        '<button class="language-button" type="button" data-language-button="en" aria-pressed="false">EN</button>' +
        '<button class="language-button" type="button" data-language-button="zh" aria-pressed="false">中文</button>' +
      "</div>"
    );
  }

  function headerMarkup(activePage) {
    var links = [
      { key: "work", href: "/products/", en: "Work", zh: "作品" },
      { key: "notes", href: "/archives/", en: "Notes", zh: "文章" },
      { key: "about", href: "/about/", en: "About", zh: "关于" },
      { key: "contact", href: "/about/#contact", en: "Contact", zh: "联系" }
    ];
    var nav = links.map(function (link) {
      var current = activePage === link.key || activePage === "contact" && link.key === "about";
      return (
        '<a class="nav-link" href="' + link.href + '"' + (current ? ' aria-current="page"' : "") + ">" +
          bilingual(link.en, link.zh) +
        "</a>"
      );
    }).join("");

    return (
      '<div class="site-header__inner">' +
        '<a class="site-brand" href="/" aria-label="Curtis Young home"><span>CY</span><i class="site-brand__dot" aria-hidden="true"></i></a>' +
        '<div class="site-nav-shell" data-mobile-panel>' +
          '<nav class="site-nav" aria-label="Primary navigation">' + nav + "</nav>" +
          languageSwitchMarkup("site-nav__language") +
        "</div>" +
        '<div class="site-actions">' +
          languageSwitchMarkup("site-actions__language") +
          '<button class="icon-button" type="button" data-menu-button aria-expanded="false" aria-label="Open menu">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
          "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function footerMarkup() {
    return (
      '<div class="content-container site-footer__inner">' +
        '<span class="meta-text">© <span data-current-year></span> Curtis Young</span>' +
        '<div class="site-footer__links">' +
          '<a href="https://github.com/CurtisYoung18" target="_blank" rel="noopener">GitHub</a>' +
          '<a href="mailto:magicyoung63@yahoo.com">Email</a>' +
          '<a href="/files/Zhiyang_Mei_Resume.pdf">' + bilingual("CV", "简历") + "</a>" +
        "</div>" +
      "</div>"
    );
  }

  function mountChrome() {
    var header = document.querySelector("[data-site-header]") || document.querySelector("header");
    if (header) {
      header.className = "site-header";
      header.setAttribute("data-site-header", "");
      header.innerHTML = headerMarkup(getActivePage());
    }

    var footer = document.querySelector("[data-site-footer]") || document.querySelector("footer.footer");
    if (footer) {
      footer.className = "site-footer";
      footer.setAttribute("data-site-footer", "");
      footer.innerHTML = footerMarkup();
    }

    document.querySelectorAll("[data-current-year]").forEach(function (item) {
      item.textContent = String(new Date().getFullYear());
    });
  }

  function updatePageMetadata(language) {
    if (!document.body) return;
    var title = document.body.dataset[language === "zh" ? "titleZh" : "titleEn"];
    var description = document.body.dataset[language === "zh" ? "descriptionZh" : "descriptionEn"];
    if (title) document.title = title;
    var meta = document.querySelector('meta[name="description"]');
    if (description && meta) meta.setAttribute("content", description);
  }

  function updateArticleTranslation(language) {
    if (!document.body.classList.contains("legacy-article-page")) return;
    var matchKey = Object.keys(articleTranslations).find(function (key) {
      return window.location.pathname.indexOf(key) === 0;
    });
    if (!matchKey) return;

    var translation = articleTranslations[matchKey];
    var title = document.querySelector(".gofav-header-title");
    if (title) {
      if (!title.dataset.originalTitle) title.dataset.originalTitle = title.textContent.trim();
      title.textContent = language === "en" ? translation.title : title.dataset.originalTitle;
      document.title = (language === "en" ? translation.title : title.dataset.originalTitle) + " | Curtis Young";
    }

    var notice = document.querySelector(".language-notice");
    if (notice) notice.hidden = language !== "en";
  }

  function setLanguage(language, persist) {
    if (validLanguages.indexOf(language) === -1) language = "en";
    document.documentElement.dataset.language = language;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-language-button]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.languageButton === language));
    });
    document.querySelectorAll(".copy-btn").forEach(function (button) {
      button.textContent = language === "zh" ? "复制" : "Copy";
    });
    var menuButton = document.querySelector("[data-menu-button]");
    if (menuButton) {
      var open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-label", language === "zh" ? (open ? "关闭菜单" : "打开菜单") : (open ? "Close menu" : "Open menu"));
    }
    updatePageMetadata(language);
    updateArticleTranslation(language);
    if (persist) {
      try {
        window.localStorage.setItem(LANGUAGE_KEY, language);
      } catch (error) {
        return;
      }
    }
    document.dispatchEvent(new CustomEvent("curtis:languagechange", { detail: { language: language } }));
  }

  function initLanguageControls() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-language-button]");
      if (!button) return;
      setLanguage(button.dataset.languageButton, true);
    });
    window.addEventListener("storage", function (event) {
      if (event.key === LANGUAGE_KEY && validLanguages.indexOf(event.newValue) !== -1) {
        setLanguage(event.newValue, false);
      }
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    if (!button) return;

    function closeMenu() {
      document.body.classList.remove("menu-open");
      button.setAttribute("aria-expanded", "false");
      var iconPath = button.querySelector("path");
      if (iconPath) iconPath.setAttribute("d", "M4 7h16M4 12h16M4 17h16");
      var language = document.documentElement.dataset.language || "en";
      button.setAttribute("aria-label", language === "zh" ? "打开菜单" : "Open menu");
    }

    button.addEventListener("click", function () {
      var open = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", open);
      button.setAttribute("aria-expanded", String(open));
      var iconPath = button.querySelector("path");
      if (iconPath) iconPath.setAttribute("d", open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16");
      var language = document.documentElement.dataset.language || "en";
      button.setAttribute("aria-label", language === "zh" ? (open ? "关闭菜单" : "打开菜单") : (open ? "Close menu" : "Open menu"));
    });

    document.querySelectorAll(".site-nav a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initReveals() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach(function (element) { element.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -2%", threshold: 0.05 });
    elements.forEach(function (element) { observer.observe(element); });
  }

  function initProjectFilters() {
    var buttons = document.querySelectorAll("[data-filter]");
    var projects = document.querySelectorAll("[data-project-category]");
    if (!buttons.length || !projects.length) return;
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.dataset.filter;
        buttons.forEach(function (item) {
          item.setAttribute("aria-pressed", String(item === button));
        });
        projects.forEach(function (project) {
          project.hidden = filter !== "all" && project.dataset.projectCategory !== filter;
        });
      });
    });
  }

  function initCodeCopyButtons() {
    document.querySelectorAll(".post-content pre").forEach(function (pre) {
      if (pre.querySelector(".copy-btn")) return;
      var button = document.createElement("button");
      button.className = "copy-btn";
      button.type = "button";
      button.textContent = document.documentElement.dataset.language === "zh" ? "复制" : "Copy";
      button.addEventListener("click", function () {
        var code = pre.querySelector("code");
        var text = code ? code.textContent : pre.textContent;
        var copy = navigator.clipboard && navigator.clipboard.writeText
          ? navigator.clipboard.writeText(text)
          : Promise.reject(new Error("Clipboard unavailable"));
        copy.then(function () {
          button.textContent = document.documentElement.dataset.language === "zh" ? "已复制" : "Copied";
          window.setTimeout(function () {
            button.textContent = document.documentElement.dataset.language === "zh" ? "复制" : "Copy";
          }, 1600);
        }).catch(function () {
          button.textContent = document.documentElement.dataset.language === "zh" ? "复制失败" : "Copy failed";
        });
      });
      pre.appendChild(button);
    });
  }

  function enhanceLegacyArticle() {
    if (window.location.pathname === "/archives/" || !document.querySelector(".post-content")) return;
    document.body.classList.add("legacy-article-page");
    var oldTitle = document.querySelector(".gofav-header-title");
    if (oldTitle && oldTitle.tagName !== "H1") {
      var heading = document.createElement("h1");
      heading.className = oldTitle.className;
      heading.innerHTML = oldTitle.innerHTML;
      oldTitle.replaceWith(heading);
    }
    var headerCard = document.querySelector(".gofav-header-card");
    if (!headerCard || document.querySelector(".language-notice")) return;
    var notice = document.createElement("aside");
    notice.className = "language-notice";
    notice.hidden = true;
    notice.textContent = "This long-form note is preserved in its original Chinese. The title and an English abstract are available here; the complete bilingual interface remains active throughout the site.";
    var matchKey = Object.keys(articleTranslations).find(function (key) {
      return window.location.pathname.indexOf(key) === 0;
    });
    if (matchKey) {
      var summary = document.createElement("p");
      summary.textContent = articleTranslations[matchKey].summary;
      notice.appendChild(summary);
    }
    headerCard.insertAdjacentElement("afterend", notice);
  }

  function init() {
    if (!document.body) return;
    enhanceLegacyArticle();
    mountChrome();
    initLanguageControls();
    initMenu();
    initReveals();
    initProjectFilters();
    initCodeCopyButtons();
    setLanguage(getStoredLanguage(), false);
  }

  document.documentElement.dataset.language = getStoredLanguage();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.CurtisSite = { setLanguage: setLanguage };
})();
