# DeepSeek Studio Assistant

The site is deployed as static GitHub Pages, so the DeepSeek API key must not be placed in browser JavaScript. The command bars call an optional proxy endpoint. If that endpoint is empty or unavailable, `/js/studio.js` falls back to the local project matcher.

## Where AI Is Used

- Homepage: recommends what to explore or build next.
- Work: routes visitor intent to relevant case studies.
- About: explains Curtis Studio's method and focus.
- Log: recommends notes based on agent, tool-calling, design, or personal queries.

## DeepSeek Model

Default model: `deepseek-v4-flash`

The Worker keeps the model configurable through `DEEPSEEK_MODEL`, so it can be changed without touching the static site.

## Cloudflare Worker Setup

1. Create a Worker and paste the code from:

   `functions/deepseek-studio-assistant.worker.js`

2. Add the API key as a secret:

   ```sh
   wrangler secret put DEEPSEEK_API_KEY
   ```

3. Add allowed origins as a Worker variable:

   ```text
   ALLOWED_ORIGINS=https://curtisyoung18.github.io,http://127.0.0.1:8080,http://localhost:8080
   ```

4. Optional model override:

   ```text
   DEEPSEEK_MODEL=deepseek-v4-flash
   ```

5. Put the Worker URL in `/js/studio-ai-config.js`:

   ```js
   window.CURTIS_STUDIO_AI = {
     endpoint: "https://your-worker.your-subdomain.workers.dev",
     model: "deepseek-v4-flash",
     timeoutMs: 14000
   };
   ```

## Security Notes

- Never commit `DEEPSEEK_API_KEY`.
- `.env`, `.dev.vars`, and `wrangler.toml` are ignored.
- If an API key is pasted into chat or a public place, rotate it in the DeepSeek console before public deployment.
