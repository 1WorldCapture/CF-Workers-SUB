# AGENTS.md

## Project overview

Personal fork of `cmliu/CF-Workers-SUB`: a Cloudflare Worker that merges multiple proxy nodes/subscriptions into a single subscription link. The defining difference from upstream: it has a **built-in, hand-rolled subconverter-style rule engine** (`src/subconfig.js`) — it parses the `[custom]` SUBCONFIG syntax itself and does **not** use a third-party subconverter backend. Optimize for correctness of that engine's semantics, not for Surge/subconverter conventions.

Two independent deployment paths (see Verification):

- **Ruleset files under `Clash/`** deploy by `git push` to `master` — the Worker fetches them live from `raw.githubusercontent.com` at subscription-generation time.
- **Worker code (`src/`) and `wrangler.toml`** deploy via `npm run deploy` (esbuild bundle + `wrangler deploy`).

## Directory structure

```
src/               # Worker source (esbuild-bundled into _worker.js)
  handler.js       # Request routing, format negotiation, cache fallback
  subconfig.js     # [custom] SUBCONFIG parser + ruleset/group compiler
  clash.js         # Clash YAML generation, node normalization
  remote.js        # Remote fetch with memory + edge cache
  kv.js            # KV storage (LINK.txt editor, subscription snapshot)
  config.js        # Defaults, built-in Clash template/rules
Clash/
  Ruleset/         # Custom + ACL4SSR rulesets (fetched live from GitHub raw)
  customized-*.list
  pref.ini         # Legacy subconverter config, not used by the Worker
wrangler.toml      # LOCAL-ONLY (gitignored): KV binding + SUBCONFIG var
wrangler.toml.example
_worker.js         # Build output, gitignored
```

Note: both `wrangler.toml` and `_worker.js` are gitignored — they exist only on the dev machine and reach production via `wrangler deploy`, never via git.

## Start and stop

```bash
npm install
npm run dev        # watch-rebuild _worker.js via esbuild
wrangler dev       # local preview
npm run deploy     # build + deploy to Cloudflare Workers
```

Wrangler auth: `npx wrangler login` (OAuth token expires; non-interactive shells need `CLOUDFLARE_API_TOKEN`).

## Rule engine gotchas (learned the hard way)

1. **No inline per-line policies in `.list` files.** The compiler (`拼接规则策略` in `src/subconfig.js`) appends the SUBCONFIG ruleset policy to **every** rule line. A Surge-style `DOMAIN-SUFFIX,x.com,DIRECT` inside a list becomes an invalid 4-segment rule (`...,DIRECT,<ruleset-policy>`). One list file = one policy; when domains need different policies, split them into separate list files and give each its own `ruleset=<policy>,<url>` line in SUBCONFIG.
2. **Rule order is SUBCONFIG order, matched top-down.** Put more-specific ruleset lines (e.g. individual subdomains) before broader ones (e.g. `DOMAIN-SUFFIX` of the parent domain, PROCESS-* rules for the same app).
3. **Remote lists are cached** (`src/remote.js`): 300s in-isolate memory cache + Cloudflare edge cache whose key embeds `远程缓存版本`. After changing remote list files, bump `远程缓存版本` and `npm run deploy`, otherwise the Worker may serve stale lists for a while.
4. **KV snapshot fallback**: if any upstream subscription fetch fails, the last successfully generated snapshot is served from KV (`handler.js`), which can mask recent rule changes. A fully successful request overwrites it.
5. **Policy group names** (e.g. `美国高速`) must exist as groups — defaults are auto-built from node-name keywords (`构建默认代理组`), plus `custom_proxy_group` entries in SUBCONFIG.

## Verification

```bash
npm run check      # node --check on the bundle
npm run deploy
# Subscription format is negotiated by User-Agent, NOT by the ?sub param:
curl -s -A "clash.meta" "https://<worker>/auto?sub" | grep <rule>   # Clash YAML with rules
curl -s "https://<worker>/auto?sub" | head                          # base64 node list only
```

`auto` is the default TOKEN path (`TOKEN` env overridable). To verify a ruleset change end-to-end: push to master, confirm `raw.githubusercontent.com` serves the new file, deploy (if SUBCONFIG or cache version changed), then curl with a Clash UA and grep the generated `rules:` section for the expected `TYPE,value,POLICY` triples. A transient GitHub fetch failure can silently drop a ruleset (`安全编译规则集条目` skips on error) — retry before concluding the change is wrong.

## Handcraft

<!-- Human-maintained. Do not edit in agents-md skill updates. -->

