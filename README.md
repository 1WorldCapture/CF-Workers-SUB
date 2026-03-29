# CF-Workers-SUB

基于 [cmliu/CF-Workers-SUB](https://github.com/cmliu/CF-Workers-SUB) 的个人 fork，将多个代理节点和订阅合并为单一链接，部署在 Cloudflare Workers 上。

## 改动

- **内置 subconverter 规则解析**：不需要第三方 subconverter 后端，直接在 Worker 内解析 `[custom]` 格式的分流规则（支持 `ruleset`、`custom_proxy_group`、`clash_rule_base` 等指令）
- **模块化重构**：源码拆分到 `src/` 目录，使用 esbuild 构建
- **自定义 Clash 规则集**：在 `Clash/Ruleset/` 和 `Clash/customized-*.list` 中维护个人分流规则

## 项目结构

```
src/
├── index.js          # Worker 入口
├── handler.js        # 请求路由
├── config.js         # 默认配置与 Clash 模板
├── kv.js             # KV 存储操作
├── clash.js          # Clash 配置生成
├── subconfig.js      # 订阅转换配置
├── subscriptions.js  # 订阅拉取与合并
├── remote.js         # 远程资源获取
├── notifications.js  # TG 通知
├── ini.js            # INI 解析
└── utils.js          # 工具函数

Clash/
├── Ruleset/          # 分流规则集 (AI, Tailscale, fp-browser 等)
├── customized-*.list # 个人自定义分流规则
├── config/           # 订阅转换配置文件
└── *.list            # ACL4SSR 规则集
```

## 部署

### 前置条件

- [Node.js](https://nodejs.org/)（建议 18+）
- 一个 [Cloudflare](https://dash.cloudflare.com/) 账号

### 第一步：安装 Wrangler 并登录

```bash
# 安装 Wrangler CLI（Cloudflare 的命令行工具）
npm i -g wrangler

# 登录你的 Cloudflare 账号（会弹出浏览器让你授权）
wrangler login
```

### 第二步：创建 KV 存储

KV 用来保存你的节点和订阅数据，必须先创建：

```bash
wrangler kv namespace create KV
```

运行后会输出类似这样的内容：

```
🌀 Creating namespace with title "sub-worker-KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"    ← 记住这个 ID
```

### 第三步：修改配置文件

```bash
cp wrangler.toml.example wrangler.toml
```

用编辑器打开 `wrangler.toml`，需要修改两个地方：

#### 3a. 填入 KV ID

找到最后三行（被 `#` 注释掉的部分），去掉 `#` 号，并把 `id` 替换为你刚才创建的 KV ID：

```toml
[[kv_namespaces]]
binding = "KV"
id = "你的KV ID"    ← 替换这里
```

#### 3b. 配置自定义分流规则（可选）

在 `wrangler.toml` 末尾添加 `SUBCONFIG` 变量，使用 subconverter 的 `[custom]` 语法定义分流规则。
本项目内置了规则解析，**不需要依赖第三方 subconverter 后端**：

```toml
[vars]
SUBCONFIG = """
[custom]
; 格式：ruleset=策略组名,规则集URL
; 规则按从上到下的顺序匹配，先匹配到的优先

ruleset=DIRECT,https://raw.githubusercontent.com/你的用户名/CF-Workers-SUB/master/Clash/customized-local.list
ruleset=DIRECT,https://raw.githubusercontent.com/你的用户名/CF-Workers-SUB/master/Clash/LocalAreaNetwork.list
ruleset=美国家宽,https://raw.githubusercontent.com/你的用户名/CF-Workers-SUB/master/Clash/Ruleset/AI.list
ruleset=美国高速,https://raw.githubusercontent.com/你的用户名/CF-Workers-SUB/master/Clash/Ruleset/YouTube.list

enable_rule_generator=true
overwrite_original_rules=false
"""
```

> **说明**：策略组名（如 `美国家宽`、`美国高速`）需要与你节点名中的地域关键词匹配，系统会自动按关键词将节点归入对应策略组。
> `overwrite_original_rules=false` 表示在自定义规则之后，保留内置的默认规则作为兜底。

### 第四步：构建并部署

```bash
npm install
npm run deploy
```

部署成功后会显示你的 Worker 地址，类似：

```
https://sub-worker.<你的ID>.workers.dev
```

### 第五步：使用

部署完成后有两个入口：

| 用途 | 地址 |
|------|------|
| **设置订阅源**（添加/管理你的节点和订阅链接） | `https://sub-worker.<你的ID>.workers.dev/auto` |
| **导入订阅**（复制到代理客户端使用） | `https://sub-worker.<你的ID>.workers.dev/auto?sub` |

> 其中 `auto` 是默认 TOKEN，可通过环境变量 `TOKEN` 自定义。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `TOKEN` | `auto` | 订阅入口路径 |
| `GUESTTOKEN` / `GUEST` | - | 访客订阅 token |
| `SUBNAME` | `CF-Workers-SUB` | 订阅名称 |
| `SUBCONFIG` | - | 自定义分流规则，支持 subconverter 的 `[custom]` 语法（内置解析，无需第三方后端） |
| `TGTOKEN` | - | Telegram Bot Token（用于通知） |
| `TGID` | - | Telegram 接收通知的 Chat ID |

## 开发

```bash
# 监听文件变动自动重新构建
npm run dev

# 本地预览
wrangler dev
```

## 致谢

[cmliu/CF-Workers-SUB](https://github.com/cmliu/CF-Workers-SUB) · [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)
