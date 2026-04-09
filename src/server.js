"use strict";

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { Searcher } = require("./searcher");

const server = new McpServer({
  name: "game-knowledge",
  version: "1.0.0",
});

const searcher = new Searcher();

server.tool(
  "search_api",
  "按关键词搜索框架或Cocos API，支持中英文",
  {
    query: z
      .string()
      .describe('搜索关键词，如"延迟执行"、"窗口显示"、"资源加载"'),
    source: z
      .enum(["framework", "cocos", "all"])
      .default("all")
      .describe("搜索范围"),
  },
  async ({ query, source }) => {
    const results = await searcher.search(query, source);
    if (results.length === 0)
      return { content: [{ type: "text", text: "未找到相关API" }] };

    const text = results
      .map(
        (cls) =>
          `## ${cls.name}（${cls.module}）\n${cls.description}\n主要方法：${cls.methods
            .slice(0, 5)
            .map((m) => m.name)
            .join(", ")}`,
      )
      .join("\n\n");

    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "get_module",
  "查询某个模块包含的所有类和接口",
  {
    moduleName: z
      .string()
      .describe("模块名，如 exia-ccui、exia-data、exia-event、cocos"),
  },
  async ({ moduleName }) => {
    const text = searcher.getModule(moduleName);
    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "get_class",
  "查询某个类或接口的完整属性和方法",
  { className: z.string().describe("类名，如 Window、AssetLoader、Node") },
  async ({ className }) => {
    const text = searcher.getClass(className);
    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "get_method",
  "查询某个类的特定方法签名和说明",
  {
    className: z.string().describe("类名"),
    methodName: z.string().describe("方法名"),
  },
  async ({ className, methodName }) => {
    const text = searcher.getMethod(className, methodName);
    return { content: [{ type: "text", text }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("game-knowledge MCP Server 已启动");
}

main().catch(console.error);
