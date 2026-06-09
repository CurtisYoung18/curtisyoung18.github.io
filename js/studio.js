(function () {
  var projectHints = [
    {
      keys: ["map", "route", "travel", "mcp", "location", "poi", "itinerary"],
      title: "MY_MAP",
      note: {
        en: "Best match: MY_MAP. It shows agentic route planning, POI recommendation, and map workflows with real product UI.",
        zh: "最相关：MY_MAP。它展示了 Agent 路线规划、POI 推荐和带真实产品 UI 的地图工作流。"
      }
    },
    {
      keys: ["chat", "support", "customer", "widget", "handoff", "service"],
      title: "Live Chat Widget Integration",
      note: {
        en: "Best match: Live Chat Widget Integration. It is the strongest case for AI customer service, handoff, and embedded support UI.",
        zh: "最相关：Live Chat Widget Integration。它最能体现 AI 客服、人工交接和嵌入式支持界面。"
      }
    },
    {
      keys: ["health", "questionnaire", "triage", "diagnostic", "food", "poisoning", "form"],
      title: "Food Poisoning Questionnaire System",
      note: {
        en: "Best match: Food Poisoning Questionnaire System. It demonstrates structured intake, safety-aware outputs, and workflow guidance.",
        zh: "最相关：Food Poisoning Questionnaire System。它展示了结构化采集、安全感知输出和流程指引。"
      }
    },
    {
      keys: ["model", "evaluation", "research", "aim", "modulation", "logits", "paper"],
      title: "AI Model Modulation",
      note: {
        en: "Best match: AI Model Modulation. It anchors the studio in research-backed AI systems and evaluation thinking.",
        zh: "最相关：AI Model Modulation。它让工作室有研究支撑，也体现了模型评估思维。"
      }
    },
    {
      keys: ["email", "rag", "knowledge", "cleaning", "document", "pipeline"],
      title: "Email Processing System",
      note: {
        en: "Best match: Email Processing System. It is useful for RAG ingestion, cleaning pipelines, and knowledge-base preparation.",
        zh: "最相关：Email Processing System。它适合 RAG 摄取、清洗管线和知识库准备场景。"
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
        en: "I would start with a short workflow map: user input, tool layer, knowledge layer, response constraints, and success metric.",
        zh: "我会先画一张短工作流图：用户输入、工具层、知识层、回复约束和成功指标。"
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
        ? "可以试试：客服转人工、RAG 摄取、路线规划，或诊断采集。"
        : "Try: customer support handoff, RAG ingestion, route planning, or diagnostic intake.";
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
