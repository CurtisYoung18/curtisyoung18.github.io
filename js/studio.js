(function () {
  var projectHints = [
    {
      keys: ["map", "route", "travel", "mcp", "location", "poi", "itinerary"],
      title: "MY_MAP",
      note: {
        en: "Start with MY_MAP: route planning, POI suggestions, and agent routing wrapped in a real interface.",
        zh: "可以从 MY_MAP 看起：路线规划、POI 推荐、Agent 调度，最后都落在一个真实界面里。"
      }
    },
    {
      keys: ["chat", "support", "customer", "widget", "handoff", "service"],
      title: "Live Chat Widget Integration",
      note: {
        en: "Read the live chat widget case if you care about the messy middle: support AI, handoff, and an interface that has to fit into an existing site.",
        zh: "如果你关心客服 AI 的真实中间层，可以看 live chat widget：转人工、嵌入现有网站、以及不能打扰用户的界面。"
      }
    },
    {
      keys: ["health", "questionnaire", "triage", "diagnostic", "food", "poisoning", "form"],
      title: "Food Poisoning Questionnaire System",
      note: {
        en: "The food poisoning system is about structured intake: asking enough, not overreaching, and leaving the next step clear.",
        zh: "食物中毒问卷系统讲的是结构化采集：问够信息，不越界判断，并把下一步说清楚。"
      }
    },
    {
      keys: ["model", "evaluation", "research", "aim", "modulation", "logits", "paper"],
      title: "AI Model Modulation",
      note: {
        en: "AI Model Modulation is the research side of the studio: model behavior, evaluation, and what can be controlled below the prompt layer.",
        zh: "AI Model Modulation 是这个 studio 的研究侧：模型行为、评估，以及 prompt 之下还能控制什么。"
      }
    },
    {
      keys: ["email", "rag", "knowledge", "cleaning", "document", "pipeline"],
      title: "Email Processing System",
      note: {
        en: "Email Processing is the RAG plumbing piece: cleaning messy archives before anyone asks the model to retrieve from them.",
        zh: "Email Processing 是 RAG 的管道活：先把混乱邮件清干净，再谈让模型检索。"
      }
    }
  ];

  function currentLanguage() {
    return window.CurtisStudioI18n && window.CurtisStudioI18n.lang
      ? window.CurtisStudioI18n.lang()
      : "en";
  }

  function message(value) {
    if (typeof value === "string") return value;
    return value[currentLanguage()] || value.en;
  }

  function closestHint(query) {
    var normalized = query.toLowerCase();
    var best = null;
    var score = 0;

    projectHints.forEach(function (hint) {
      var hitCount = hint.keys.reduce(function (count, key) {
        return normalized.indexOf(key) >= 0 ? count + 1 : count;
      }, 0);

      if (hitCount > score) {
        best = hint;
        score = hitCount;
      }
    });

    return best || {
      title: "Studio Method",
      note: {
        en: "I would draw the ugly workflow first: user input, tools, knowledge, failure boundary, and how the result gets checked.",
        zh: "我会先把最难看的流程画出来：用户输入、工具、知识库、失败边界，以及结果怎么验。"
      }
    };
  }

  function aiConfig() {
    return window.CURTIS_STUDIO_AI || {};
  }

  function pageLabel() {
    var title = document.querySelector("h1");
    return title ? title.textContent.replace(/\s+/g, " ").trim() : document.title;
  }

  function localAnswer(query) {
    var hint = closestHint(query);
    return query
      ? message(hint.note)
      : currentLanguage() === "zh"
        ? "可以问：客服转人工、RAG 检索缺失、路线规划，或者 Agent 为什么会偷懒不用工具。"
        : "Try asking about support handoff, retrieval misses, route planning, or why agents avoid tools.";
  }

  async function askStudioAI(query, form) {
    var config = aiConfig();
    if (!config.endpoint || !query) return null;

    var controller = new AbortController();
    var timeout = window.setTimeout(function () {
      controller.abort();
    }, config.timeoutMs || 14000);

    try {
      var reply = await window.fetch(config.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          query: query,
          page: pageLabel(),
          path: window.location.pathname,
          language: currentLanguage(),
          source: form.getAttribute("data-response") || "studio-command"
        })
      });

      var data = await reply.json().catch(function () {
        return {};
      });

      if (!reply.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      return data.answer || null;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function bindCommand(form) {
    var input = form.querySelector("input");
    var responseId = form.getAttribute("data-response");
    var response = responseId ? document.getElementById(responseId) : null;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!input || !response) return;

      var query = input.value.trim();
      response.classList.add("is-visible");
      form.classList.add("is-active");
      form.classList.add("is-loading");
      response.textContent = query && aiConfig().endpoint
        ? currentLanguage() === "zh" ? "正在询问 DeepSeek v4 flash..." : "Asking DeepSeek v4 flash..."
        : localAnswer(query);

      try {
        var answer = await askStudioAI(query, form);
        response.textContent = answer || localAnswer(query);
      } catch (error) {
        response.textContent = localAnswer(query);
      } finally {
        form.classList.remove("is-loading");
      }
    });
  }

  function bindModeToggle(button) {
    button.addEventListener("click", function () {
      document.body.classList.toggle("studio-focus");
      button.setAttribute(
        "aria-pressed",
        document.body.classList.contains("studio-focus") ? "true" : "false"
      );
    });
  }

  function bindIndexRows() {
    var rows = Array.prototype.slice.call(document.querySelectorAll(".studio-index-row"));
    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        rows.forEach(function (item) {
          item.classList.toggle("is-active", item === row);
        });
      });
      row.addEventListener("mouseleave", function () {
        row.classList.remove("is-active");
      });
    });
  }

  function bindFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-work-filter]"));
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-work-category]"));

    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        var active = filter.getAttribute("data-work-filter");

        filters.forEach(function (button) {
          button.classList.toggle("is-active", button === filter);
        });

        items.forEach(function (item) {
          var category = item.getAttribute("data-work-category");
          item.hidden = active !== "all" && category !== active;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-studio-command]")).forEach(bindCommand);
    Array.prototype.slice.call(document.querySelectorAll("[data-studio-mode]")).forEach(bindModeToggle);
    bindIndexRows();
    bindFilters();
  });
})();
