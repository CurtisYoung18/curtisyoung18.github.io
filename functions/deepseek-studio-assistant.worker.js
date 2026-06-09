const DEFAULT_ALLOWED_ORIGINS = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "https://curtisyoung18.github.io"
];

const SITE_CONTEXT = `
Curtis Studio is the portfolio and personal studio of Zhiyang Mei / Curtis, an agent deployment engineer based in Shenzhen.

Positioning:
- Agent systems and product UI beyond the demo.
- Works on tool calls, RAG, retrieval failures, handoff rules, evaluation traces, customer-service AI, and product prototypes.
- Prefers concrete workflow maps, reliable tool layers, and interfaces that make AI behavior understandable.

Core work:
- MY_MAP: agentic route planning, POI recommendation, map workflows, RAG + agent system.
- Live Chat Widget Integration: embedded AI customer service, site widget, support handoff.
- Food Poisoning Questionnaire System: conversational diagnostic intake, structured questionnaires, safety-aware workflow guidance.
- AI Model Modulation: WWW 2025 research paper on logits redistribution and controlled model behavior.
- Email Processing System: email cleaning and RAG-ready knowledge-base preparation.
- GreenGo / Portfolio Systems: product interface and full-stack prototype experiments.

Log topics:
- Tool calling failure analysis.
- smolagents, agent loops, and tool calling.
- Customer-service agent maintainability.
- Product design and user experience.

Useful routes:
- /products/ for selected work.
- /archives/ for notes.
- /about/ for profile and studio method.
`;

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = allowedOrigins(env);
  const canUseOrigin = allowed.includes("*") || allowed.includes(origin);
  const allowOrigin = canUseOrigin ? origin || allowed[0] : allowed[0];

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "vary": "Origin"
  };
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  const allowed = allowedOrigins(env);
  return allowed.includes("*") || allowed.includes(origin);
}

async function readRequest(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "Request body must be JSON." };
  }

  const query = String(body.query || "").trim();
  const page = String(body.page || "").trim().slice(0, 120);
  const path = String(body.path || "").trim().slice(0, 120);
  const language = String(body.language || "en").trim().slice(0, 12);

  if (!query) {
    return { error: "Query is required." };
  }

  if (query.length > 600) {
    return { error: "Query is too long. Keep it under 600 characters." };
  }

  return { query, page, path, language };
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return json({ ok: true, model: env.DEEPSEEK_MODEL || "deepseek-v4-flash" }, 200, headers);
    }

    if (!isAllowedOrigin(request, env)) {
      return json({ error: "Origin is not allowed." }, 403, headers);
    }

    if (!env.DEEPSEEK_API_KEY) {
      return json({ error: "DEEPSEEK_API_KEY is not configured." }, 500, headers);
    }

    const input = await readRequest(request);
    if (input.error) {
      return json({ error: input.error }, 400, headers);
    }

    const model = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.35,
        max_tokens: 260,
        messages: [
          {
            role: "system",
            content: [
              "You are Curtis Studio's concise portfolio assistant.",
              input.language === "zh" ? "Answer in Simplified Chinese." : "Answer in English.",
              "Use only the supplied studio context. If unsure, say what page to open next.",
              "Keep answers to 1-3 short sentences. Prefer concrete project recommendations.",
              SITE_CONTEXT
            ].join("\n")
          },
          {
            role: "user",
            content: `Current page: ${input.page || "unknown"} (${input.path || "/"}).\nVisitor query: ${input.query}`
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json({
        error: "DeepSeek request failed.",
        status: response.status,
        detail: data.error && data.error.message ? data.error.message : undefined
      }, 502, headers);
    }

    const answer = data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || "").trim()
      : "";

    return json({
      answer: answer || "I would start from /products/ and pick the closest system case.",
      model,
      usage: data.usage || null
    }, 200, headers);
  }
};
