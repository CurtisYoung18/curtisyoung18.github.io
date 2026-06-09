(function () {
  var STORAGE_KEY = "curtis-studio-language";

  var zhText = {
    "[ Studio Mode ]": "[ 工作室模式 ]",
    "Work": "作品",
    "Log": "日志",
    "About": "关于",
    "AI Systems Studio": "AI 系统工作室",
    "AI systems": "有界面品味的",
    "with interface taste": "AI 系统",
    "I design and build production AI systems from agent deployment to RAG pipelines, tool-calling workflows, and customer interfaces that actually work.": "我设计并构建能投入真实场景的 AI 系统，从 Agent 部署、RAG 管线、工具调用工作流，到真正好用的客户界面。",
    "Now building agent-facing product systems": "正在构建面向 Agent 的产品系统",
    "Systems": "系统",
    "Shipped AI systems in production": "已落地的生产级 AI 系统",
    "Prototypes": "原型",
    "Interfaces, tools, and product experiments": "界面、工具和产品实验",
    "Notes": "笔记",
    "Thinking, patterns, and engineering observations": "思考、模式与工程观察",
    "Studio Method": "工作室方法",
    "How I design, build, and ship": "我如何设计、构建和交付",
    "// RAG + Agent": "// RAG + Agent",
    "// Support AI": "// 客服 AI",
    "// Diagnostic AI": "// 诊断 AI",
    "// Evaluation": "// 评估",
    "Shenzhen · Shanghai · UTC+8": "深圳 · 上海 · UTC+8",

    "Selected Work": "精选作品",
    "Systems for real-world AI work.": "面向真实 AI 工作流的系统。",
    "A curated index of agent interfaces, RAG pipelines, tool-calling workflows, and product prototypes. Each piece is framed by the problem it solves, the stack behind it, and the result it is meant to create.": "这里收录 Agent 界面、RAG 管线、工具调用工作流和产品原型。每个项目都围绕它解决的问题、背后的技术栈，以及它要创造的结果来呈现。",
    "All": "全部",
    "Agent Systems": "Agent 系统",
    "Product Prototypes": "产品原型",
    "Research": "研究",
    "AI-powered mapping assistant for plan creation, route intelligence, and location-aware recommendations.": "用于计划生成、路线智能和位置推荐的 AI 地图助手。",
    "Problem": "问题",
    "Stack": "技术栈",
    "Travel planning is fragmented across maps, notes, routes, and personal constraints.": "旅行规划常常被拆散在地图、笔记、路线和个人限制之间。",
    "Demo ↗": "演示 ↗",
    "GitHub ↗": "GitHub ↗",
    "Embeddable AI chat for websites with knowledge-base answers, handoff, and customer-service workflows.": "可嵌入网站的 AI 对话组件，支持知识库回答、转人工和客服工作流。",
    "Support teams need an AI layer that can answer, route, and escalate without breaking the existing site.": "客服团队需要一个不会破坏现有网站、又能回答、路由和升级问题的 AI 层。",
    "Conversational intake and questionnaire management for health triage and structured risk guidance.": "面向健康分诊和结构化风险指引的对话式问卷系统。",
    "Users need clear guidance while nursing teams need safer, more complete structured intake data.": "用户需要清晰指引，护理团队需要更安全、更完整的结构化采集数据。",
    "Research-backed model modulation with logits redistribution for controlled model behaviors.": "基于研究的模型调制方法，通过 logits 重新分布控制模型行为。",
    "Teams need consistent model behavior across complex contexts without relying only on prompt wording.": "团队需要在复杂上下文中获得一致模型行为，而不是只依赖提示词措辞。",
    "Paper ↗": "论文 ↗",
    "Cleaning and transforming email archives into RAG-ready knowledge-base material.": "清洗并转换邮件档案，使其成为可用于 RAG 的知识库材料。",
    "Raw email data is noisy, inconsistent, and hard to retrieve from without a reliable preparation pipeline.": "原始邮件数据噪声多、格式不一致，没有可靠预处理管线就很难检索。",
    "Product interface experiments across community platforms, data views, and full-stack web prototypes.": "围绕社区平台、数据视图和全栈 Web 原型的产品界面实验。",
    "Early products need convincing interface prototypes before engineering and product decisions harden.": "早期产品在工程和产品决策固化前，需要有说服力的界面原型。",
    "Explore ↗": "探索 ↗",
    "From ambiguous workflow to shipped AI surface.": "从模糊工作流到可交付的 AI 界面。",
    "The studio method is intentionally small: map the workflow, define the tool and knowledge layers, design the interface contract, then evaluate whether the system actually helps users complete the job.": "工作室方法刻意保持克制：先梳理工作流，再定义工具层与知识层，设计界面契约，最后评估系统是否真的帮助用户完成任务。",
    "The next version of this page can connect the command bar to a real AI assistant that answers from project notes, case studies, and implementation logs.": "下一版页面可以把命令条连接到真正的 AI 助手，从项目笔记、案例和实现日志中回答问题。",
    "Available for AI systems and product prototypes": "可承接 AI 系统与产品原型",

    "I turn AI workflows into usable systems.": "我把 AI 工作流变成可用系统。",
    "I am Zhiyang Mei, an agent deployment engineer based in Shenzhen. Curtis Studio is the public surface for my AI systems work: product UI, RAG pipelines, tool-calling workflows, evaluation, and production handoff.": "我是 Zhiyang Mei，一名常驻深圳的 Agent 部署工程师。Curtis Studio 是我公开呈现 AI 系统工作的入口：产品 UI、RAG 管线、工具调用工作流、评估与生产交付。",
    "01 Profile": "01 简介",
    "I build AI-facing product systems with a bias toward clear interfaces, reliable tool layers, and workflows that survive contact with real users.": "我构建面向 AI 的产品系统，偏好清晰界面、可靠工具层，以及经得起真实用户检验的工作流。",
    "Base": "所在地",
    "Focus": "方向",
    "Education": "教育",
    "Shenzhen, China": "中国深圳",
    "Agent deployment, RAG, product UI": "Agent 部署、RAG、产品 UI",
    "M.Sc. IT, University of Queensland": "昆士兰大学信息技术硕士",
    "Machine learning, AI security": "机器学习、AI 安全",
    "Email ↗": "邮件 ↗",
    "Selected Work ↗": "精选作品 ↗",
    "Map the workflow": "梳理工作流",
    "Start from the user's job, failure modes, human handoff, and the data needed to make the AI useful.": "从用户任务、失败模式、人工交接，以及让 AI 真正有用所需的数据开始。",
    "Define the tool layer": "定义工具层",
    "Shape APIs, retrieval, database actions, and guardrails before polishing prompts or UI states.": "先设计 API、检索、数据库动作和护栏，再打磨提示词与界面状态。",
    "Design the interface contract": "设计界面契约",
    "Make the system explain what it knows, what it did, and what the user can safely do next.": "让系统说明它知道什么、做了什么，以及用户下一步可以安全做什么。",
    "Evaluate in context": "在上下文中评估",
    "Test with real flows: retrieval misses, tool errors, ambiguous user intent, and escalation boundaries.": "用真实流程测试：检索缺失、工具错误、模糊意图和升级边界。",
    "02 Credentials": "02 背书",
    "Research-backed, product-facing.": "有研究支撑，面向产品落地。",
    "Proceedings of the ACM Web Conference, WWW 2025.": "ACM Web Conference 会议论文，WWW 2025。",
    "Information Technology": "信息技术",
    "EAIT, University of Queensland. GPA 6.1 / 7. Advanced software engineering, databases, AI.": "昆士兰大学 EAIT，GPA 6.1 / 7。学习方向包括高级软件工程、数据库与人工智能。",
    "International Economics and Trade": "国际经济与贸易",
    "School of Business, Shantou University.": "汕头大学商学院。",
    "03 Signals": "03 信号",
    "What this studio is good for.": "这个工作室擅长什么。",
    "Systems, prototypes, and notes": "系统、原型与笔记",

    "Studio Log": "工作室日志",
    "Notes from the studio floor.": "来自工作室现场的笔记。",
    "A running archive of agent engineering notes, product design observations, and personal collections. The AI systems posts are the strongest signal: tool calling, maintainability, support workflows, and failure analysis.": "这里持续记录 Agent 工程笔记、产品设计观察和个人收藏。其中 AI 系统文章是最强信号：工具调用、可维护性、客服工作流和故障排查。",
    "Design": "设计",
    "Personal": "个人",
    "Tool calling failure analysis from a real agent workflow.": "一次真实 Agent 工作流中的工具调用失效排查。",
    "Signal": "信号",
    "A practical debugging note about when an agent avoids tools, why that matters, and how to trace the behavior.": "一篇实用排查笔记：Agent 何时会绕开工具、为什么危险，以及如何追踪这种行为。",
    "Read ↗": "阅读 ↗",
    "A closer look at agent structure through smolagents.": "通过 smolagents 观察 Agent 结构。",
    "An engineering-oriented explanation of how tools, model reasoning, and execution loops fit together.": "从工程视角解释工具、模型推理和执行循环如何协作。",
    "Maintainability notes for customer-service agent systems.": "客服 Agent 系统的可维护性笔记。",
    "Useful for support AI: handoff boundaries, product ownership, and keeping behavior understandable.": "适合客服 AI：人工交接边界、产品责任归属，以及让行为保持可理解。",
    "Engineering notes on tool calling as the core agent interface.": "关于工具调用作为 Agent 核心界面的工程笔记。",
    "Connects model output, function signatures, tool execution, and product-side safety expectations.": "连接模型输出、函数签名、工具执行和产品侧安全预期。",
    "Product design notes on interface feeling and user perception.": "关于界面感受和用户感知的产品设计笔记。",
    "A useful companion to the studio's interface direction: systems need taste, not only capability.": "它补充了工作室的界面方向：系统需要品味，而不只是能力。",
    "A personal catalogue of games and play memories.": "个人游戏与游玩记忆目录。",
    "A softer archive item that keeps the site personal rather than only professional.": "让网站保留个人质感，而不只是职业展示。",
    "Music collection notes and the story behind Go Fav.": "音乐收藏笔记，以及 Go Fav 背后的故事。",
    "A personal collection page that adds texture to the studio identity.": "为工作室身份增加质地的个人收藏页面。",
    "Logbook for agent systems and interface notes": "Agent 系统与界面笔记的日志簿"
  };

  var zhAttributes = {
    "Ask the studio what to build next...": "问工作室下一步该构建什么...",
    "Find a case study...": "查找相关案例...",
    "Ask about method...": "询问方法...",
    "Ask which note to read...": "询问该读哪篇笔记..."
  };

  var titles = {
    "/": { en: "Curtis Studio", zh: "Curtis Studio | AI 系统工作室" },
    "/products/": { en: "Work | Curtis Studio", zh: "作品 | Curtis Studio" },
    "/about/": { en: "About | Curtis Studio", zh: "关于 | Curtis Studio" },
    "/archives/": { en: "Log | Curtis Studio", zh: "日志 | Curtis Studio" }
  };

  function normalized(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function storedLanguage() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || "en";
    } catch (error) {
      return "en";
    }
  }

  function urlLanguage() {
    try {
      var requested = new URLSearchParams(window.location.search).get("lang");
      return requested === "zh" || requested === "en" ? requested : null;
    } catch (error) {
      return null;
    }
  }

  function setStoredLanguage(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // localStorage may be blocked; the page still switches for this session.
    }
  }

  function shouldSkip(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    return /^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE)$/i.test(parent.tagName);
  }

  function translateTextNodes(lang) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodes = [];
    var node;

    while ((node = walker.nextNode())) {
      nodes.push(node);
    }

    nodes.forEach(function (textNode) {
      if (shouldSkip(textNode)) return;
      if (!textNode.__studioOriginalText) {
        textNode.__studioOriginalText = textNode.nodeValue;
      }

      var original = textNode.__studioOriginalText;
      var key = normalized(original);
      var translated = zhText[key];

      if (lang === "zh" && translated) {
        var leading = original.match(/^\s*/)[0];
        var trailing = original.match(/\s*$/)[0];
        textNode.nodeValue = leading + translated + trailing;
      } else {
        textNode.nodeValue = original;
      }
    });
  }

  function translateAttributes(lang) {
    Array.prototype.slice.call(document.querySelectorAll("input[placeholder]")).forEach(function (input) {
      if (!input.dataset.studioOriginalPlaceholder) {
        input.dataset.studioOriginalPlaceholder = input.getAttribute("placeholder") || "";
      }

      var original = input.dataset.studioOriginalPlaceholder;
      input.setAttribute("placeholder", lang === "zh" && zhAttributes[original] ? zhAttributes[original] : original);
    });
  }

  function setTitle(lang) {
    var path = window.location.pathname;
    var title = titles[path] || titles[path.replace(/\/index\.html$/, "/")];
    if (title) {
      document.title = title[lang] || title.en;
    } else if (lang === "zh") {
      document.title = document.title.replace(" | Curtis Studio", " | Curtis Studio");
    }
  }

  function makeToggle() {
    if (document.querySelector("[data-studio-lang-toggle]")) return;

    var target = document.querySelector(".studio-nav-right") || document.querySelector(".menu");
    if (!target) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "studio-lang-toggle";
    button.setAttribute("data-studio-lang-toggle", "");
    button.addEventListener("click", function () {
      applyLanguage(currentLanguage() === "zh" ? "en" : "zh", true);
    });

    if (target.classList.contains("menu")) {
      target.appendChild(button);
    } else {
      var gridMark = target.querySelector(".studio-grid-mark");
      target.insertBefore(button, gridMark || null);
    }
  }

  function currentLanguage() {
    return document.documentElement.getAttribute("data-studio-lang") || storedLanguage();
  }

  function applyLanguage(lang, persist) {
    var next = lang === "zh" ? "zh" : "en";
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    document.documentElement.setAttribute("data-studio-lang", next);

    if (persist) {
      setStoredLanguage(next);
    }

    translateTextNodes(next);
    translateAttributes(next);
    setTitle(next);

    Array.prototype.slice.call(document.querySelectorAll("[data-studio-lang-toggle]")).forEach(function (button) {
      button.textContent = next === "zh" ? "EN" : "中文";
      button.setAttribute("aria-label", next === "zh" ? "Switch to English" : "切换到中文");
    });

    window.dispatchEvent(new CustomEvent("studio:languagechange", { detail: { language: next } }));
  }

  window.CurtisStudioI18n = {
    apply: applyLanguage,
    lang: currentLanguage,
    text: function (key, fallback) {
      return currentLanguage() === "zh" && zhText[key] ? zhText[key] : fallback || key;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    makeToggle();
    var requested = urlLanguage();
    applyLanguage(requested || storedLanguage(), Boolean(requested));
  });
})();
