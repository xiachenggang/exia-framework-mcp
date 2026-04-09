# game-knowledge MCP Server

为 Cocos Creator 3.8.8 + exia-framework 提供 AI 知识库查询服务。

索引文件（`index/`）和 `.d.ts` 文件（`dts/`）已预构建并提交到仓库，clone 后即可直接使用。

---

## 目录

- [game-knowledge MCP Server](#game-knowledge-mcp-server)
  - [目录](#目录)
  - [快速安装](#快速安装)
  - [配置 AI 编辑器](#配置-ai-编辑器)
    - [Claude Code](#claude-code)
    - [Cursor](#cursor)
  - [可用工具](#可用工具)
  - [框架更新后同步索引（框架维护者操作）](#框架更新后同步索引框架维护者操作)
  - [首次构建索引](#首次构建索引)
  - [项目结构说明](#项目结构说明)

---

## 快速安装

> 要求：Node.js >= 22

```bash
git clone <仓库地址> ~/exia/exia-framework-mcp
cd ~/exia/exia-framework-mcp
npm install
```

安装完成后无需启动，AI 编辑器会在需要时自动拉起 MCP Server。

---

## 配置 AI 编辑器

### Claude Code

在游戏项目目录的 `.claude/settings.json`（或全局 `~/.claude/settings.json`）中添加：

```json
{
  "mcpServers": {
    "game-knowledge": {
      "command": "node",
      "args": ["/你实际clone的路径/exia-framework-mcp/src/server.js"]
    }
  }
}
```

配置后重启 Claude Code，运行 `/mcp` 命令确认 `game-knowledge` 状态为 connected。

### Cursor

在游戏项目根目录的 `.cursor/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "game-knowledge": {
      "command": "node",
      "args": ["/你实际clone的路径/bit-framework-mcp/src/server.js"]
    }
  }
}
```

---

## 可用工具

MCP Server 启动后，AI 可直接调用以下工具查询 API：

| 工具         | 说明                       | 示例                             |
| ------------ | -------------------------- | -------------------------------- |
| `search_api` | 语义搜索（支持中英文互搜） | `search_api("延迟执行")`         |
| `get_module` | 查询模块包含的所有类/接口  | `get_module("bit-ui")`           |
| `get_class`  | 查询类的完整属性和方法     | `get_class("Window")`            |
| `get_method` | 查询特定方法签名           | `get_method("Window", "onShow")` |

**search_api 支持的 source 参数：**

- `all`（默认）：同时搜索框架和 Cocos 引擎 API
- `framework`：只搜索 bit-framework 模块
- `cocos`：只搜索 Cocos Creator 3.8.8 API

---

## 框架更新后同步索引（框架维护者操作）

1. 安装 cross-env：

```bash
npm install --save-dev cross-env
```

> 普通成员不需要执行此步骤，`git pull` 拉取最新索引后重启编辑器即可。

```bash
# 1. 手动复制有变动的模块 .d.ts（以 exia-ccui 为例）
cp /path/to/exia-framework/exia-ccui.d.ts dts/framework/exia-ccui.d.ts

# 2. 重建索引（首次运行需下载向量模型 ~120MB，存入 models/ 目录）
npm run sync

# 3. 提交并推送（不需要提交 models/ 目录，已在 .gitignore 中）
git add dts/ index/
git commit -m "chore: 同步框架索引 vX.X.X"
git push
```

国内网络若下载模型超时，`npm run sync` 默认已启用 `hf-mirror.com` 镜像，也可手动指定：

```bash
HF_ENDPOINT=https://hf-mirror.com npm run sync
```

---

## 首次构建索引

仓库已包含预构建索引，以下步骤仅在**完全重建**时需要。

```bash
# 1. 放入 Cocos 3.8.8 类型定义
cp /path/to/cc.d.ts dts/cocos/cc.d.ts

# 2. 放入框架 .d.ts（每个模块一个文件）
cp /path/to/exia-ccui.d.ts      dts/framework/exia-ccui.d.ts
cp /path/to/exia-data.d.ts     dts/framework/exia-data.d.ts
# ... 其余模块同理

# 3. 构建索引（Cocos 类较多，向量化需要几分钟）
npm run sync

# 4. 提交
git add dts/ index/
git commit -m "feat: 初始化框架索引"
git push
```

---

## 项目结构说明

```
exia-framework-mcp/
├── src/
│   ├── server.js          # MCP Server 入口，定义 4 个查询工具
│   ├── searcher.js        # 索引查询逻辑（关键词 + 向量语义搜索）
│   └── build-index.js     # 索引构建脚本（解析 .d.ts → JSON + 向量）
├── dts/
│   ├── framework/         # exia-framework 各模块 .d.ts（已预置）
│   └── cocos/             # cc.d.ts（Cocos 3.8.8，已预置）
├── index/                 # 构建产物（已预置，勿手动修改）
│   ├── framework.json     # 框架类索引
│   ├── framework-vectors.json  # 框架语义向量
│   ├── cocos.json         # Cocos 类索引
│   └── cocos-vectors.json # Cocos 语义向量
├── models/                # 向量模型缓存（.gitignore，本地自动生成）
└── package.json
```
