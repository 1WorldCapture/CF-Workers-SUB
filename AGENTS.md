# AGENTS.md

## Project overview

Personal fork of `cmliu/CF-Workers-SUB`: a Cloudflare Worker that merges multiple proxy nodes/subscriptions into a single subscription link. The defining difference from upstream: it has a **built-in, hand-rolled subconverter-style rule engine** (`src/subconfig.js`) — it parses the `[custom]` SUBCONFIG syntax itself and does **not** use a third-party subconverter backend. Optimize for correctness of that engine's semantics, not for Surge/subconverter conventions.

Two independent deployment paths (see Verification):

- **Ruleset files under `Clash/`** deploy by `git push` to `master` — the Worker fetches them live from `raw.githubusercontent.com` at subscription-generation time.
- **Worker code (`src/`) and `wrangler.toml`** deploy via `npm run deploy` (esbuild bundle + `wrangler deploy`).

Common failure trap: the SUBCONFIG (`ruleset=<policy>,<url>` lines) lives only in the local gitignored `wrangler.toml` `[vars]`. Pushing a new list file to git does nothing until a matching `ruleset=` line is added to `wrangler.toml` **and** the Worker is redeployed.

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
2. **Rule order is SUBCONFIG order, matched top-down; there is no prepend directive.** The emitted `rules:` section is the SUBCONFIG `ruleset=` lines flattened in order, then (with `overwrite_original_rules=false`) the built-in template from `src/config.js` appended at the bottom. Exact-string dedup (`去重保序`) keeps the **first** occurrence, so an earlier ruleset silently shadows later duplicates. To make rules win over everything else (e.g. PROCESS-* rules), put their single-policy list file's `ruleset=` line **first** in SUBCONFIG.
3. **The config-wide catch-all is the last line of the built-in template** (`MATCH,...` at the tail of `内置Clash规则` in `src/config.js`), not a SUBCONFIG entry. Changing the fallback policy = edit that line + `npm run deploy`.
4. **Remote lists are cached** (`src/remote.js`): 300s in-isolate memory cache + Cloudflare edge cache whose key embeds `远程缓存版本`. After changing remote list files, bump `远程缓存版本` and `npm run deploy`, otherwise the Worker may serve stale lists for a while. A brand-new list URL is never stale — but it only takes effect once its `ruleset=` line is deployed (see overview).
5. **KV snapshot fallback**: if any upstream subscription fetch fails, the last successfully generated snapshot is served from KV (`handler.js`), which can mask recent rule changes. A fully successful request overwrites it — and a ruleset silently dropped by a transient GitHub failure can itself become the new snapshot. When validating a change, fetch 2–3 times before concluding anything.
6. **Policy group names** (e.g. `美国高速`) must exist as groups — defaults are auto-built from node-name keywords (`构建默认代理组` in `src/clash.js`: `美国家宽` = 美国+家宽, `美国高速`/`dialer` = `/美国|US/i` minus 家宽, `家宽`, `苏菲家宽`), plus `custom_proxy_group` entries in SUBCONFIG. Any policy name referenced by a rule but never defined is **auto-created** as a select group matched by substring against node names (empty → `DIRECT`), so a typo'd policy silently becomes a near-empty group instead of an error.

## Verification

```bash
npm run check      # node --check on the bundle
npm run deploy
# Subscription format is negotiated by User-Agent, NOT by the ?sub param:
curl -s -A "clash.meta" "https://<worker>/auto?sub" | grep <rule>   # Clash YAML with rules
curl -s "https://<worker>/auto?sub" | head                          # base64 node list only
```

`auto` is the default TOKEN path (`TOKEN` env overridable) — do not commit the real worker URL, it is a live subscription endpoint. To verify a ruleset change end-to-end: push to master, confirm `raw.githubusercontent.com` serves the new file, deploy (if SUBCONFIG or cache version changed), then curl with a Clash UA and grep the generated `rules:` section for the expected `TYPE,value,POLICY` triples. A transient GitHub fetch failure can silently drop a ruleset (`安全编译规则集条目` skips on error) — retry before concluding the change is wrong. Two more checking notes: `proxy-groups` are emitted as JSON flow-style entries (`{"name":"美国高速",...}`), so grep for the quoted form, not `name: <group>`; and clients cache the profile per `Profile-Update-Interval` (hours), so curl is the reliable check, not the client UI.

## Handcraft

<!-- Human-maintained. Do not edit in agents-md skill updates. -->
