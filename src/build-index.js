#!/usr/bin/env node
"use strict";

const { Project, ClassDeclaration } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRAMEWORK_DTS_DIR = path.join(ROOT, "dts/framework");
const COCOS_DTS_PATH = path.join(ROOT, "dts/cocos/cc.d.ts");
const INDEX_DIR = path.join(ROOT, "index");

function moduleNameFromFile(filePath) {
  // 文件名约定：bit-ui.d.ts → bit-ui
  return path.basename(filePath, ".d.ts");
}

function buildClassInfo(cls, moduleName) {
  const name = cls.getName() ?? "Unknown";
  const description = cls
    .getJsDocs()
    .map((doc) => doc.getDescription())
    .join(" ")
    .trim();

  const mappedMethods = cls.getMethods().map((m) => ({
    name: m.getName(),
    signature: m.getText().split("{")[0].trim(),
    description: m
      .getJsDocs()
      .map((doc) => doc.getDescription())
      .join(" ")
      .trim(),
    searchText: `${m.getName()} ${m
      .getJsDocs()
      .map((doc) => doc.getDescription())
      .join(" ")}`,
  }));

  const mappedProperties = cls.getProperties().map((p) => ({
    name: p.getName(),
    type: p.getType().getText(),
    description: p
      .getJsDocs()
      .map((doc) => doc.getDescription())
      .join(" ")
      .trim(),
  }));

  return {
    name,
    module: moduleName,
    description,
    // Class 单继承；Interface 可多继承（getExtends 返回数组）
    extends:
      cls instanceof ClassDeclaration
        ? cls.getExtends()?.getExpression().getText()
        : (() => {
            const ifaces = cls.getExtends?.() ?? [];
            return ifaces.length > 0
              ? ifaces.map((e) => e.getExpression().getText()).join(", ")
              : undefined;
          })(),
    methods: mappedMethods,
    properties: mappedProperties,
    // searchText 包含方法名和属性名，使"延迟执行"能命中含 scheduleOnce 方法的类
    searchText:
      `${name} ${description} ${moduleName} ` +
      `${mappedMethods.map((m) => m.searchText).join(" ")} ` +
      `${mappedProperties.map((p) => `${p.name} ${p.description}`).join(" ")}`,
  };
}

/** 将一批类/接口/函数写入索引，container 为 SourceFile 或 ModuleDeclaration */
function indexContainer(container, mod, indexData) {
  for (const cls of container.getClasses()) {
    const info = buildClassInfo(cls, mod);
    if (indexData.classes[info.name]) {
      console.warn(
        `[WARN] 重名类: "${info.name}" 在模块 ${mod} 中重复，与模块 ${indexData.classes[info.name].module} 冲突，将被覆盖`,
      );
    }
    indexData.classes[info.name] = info;
    if (!indexData.modules[mod]) indexData.modules[mod] = [];
    indexData.modules[mod].push(info.name);
  }

  for (const iface of container.getInterfaces()) {
    const info = buildClassInfo(iface, mod);
    if (indexData.classes[info.name]) {
      console.warn(
        `[WARN] 重名接口: "${info.name}" 在模块 ${mod} 中重复，与模块 ${indexData.classes[info.name].module} 冲突，将被覆盖`,
      );
    }
    indexData.classes[info.name] = info;
    if (!indexData.modules[mod]) indexData.modules[mod] = [];
    indexData.modules[mod].push(info.name);
  }

  // 索引独立函数（装饰器等），如 uiclass、uiprop、ecsclass
  for (const func of container.getFunctions()) {
    const funcName = func.getName();
    if (!funcName) continue;
    const funcDesc = func
      .getJsDocs()
      .map((doc) => doc.getDescription())
      .join(" ")
      .trim();
    const info = {
      name: funcName,
      module: mod,
      description: funcDesc,
      kind: "function",
      signature: func.getText().split("\n")[0].trim(),
      methods: [],
      properties: [],
      searchText: `${funcName} ${funcDesc} ${mod}`,
    };
    if (indexData.classes[funcName]) {
      console.warn(
        `[WARN] 重名函数: "${funcName}" 在模块 ${mod} 中与已有条目冲突，将被覆盖`,
      );
    }
    indexData.classes[funcName] = info;
    if (!indexData.modules[mod]) indexData.modules[mod] = [];
    indexData.modules[mod].push(funcName);
  }
}

function buildIndex(dtsPaths, moduleName, indexData) {
  const project = new Project({ addFilesFromTsConfig: false });

  for (const dtsPath of dtsPaths) {
    if (!fs.existsSync(dtsPath)) {
      console.warn(`[SKIP] 文件不存在: ${dtsPath}`);
      continue;
    }
    const sourceFile = project.addSourceFileAtPath(dtsPath);
    const mod = moduleName ?? moduleNameFromFile(dtsPath);

    // 顶层类/接口/函数
    indexContainer(sourceFile, mod, indexData);

    // 处理 declare module "xxx" { ... } 块（如 cc.d.ts 的结构）
    for (const modDecl of sourceFile.getModules()) {
      indexContainer(modDecl, mod, indexData);
    }
  }
}

/**
 * 为索引中所有类生成语义向量
 * 使用多语言模型，"定时器"与"timer/scheduler"语义接近，支持中英互搜
 * 首次运行需下载模型（~120MB），之后使用本地缓存
 */
async function buildVectors(indexData, embedder) {
  const classes = Object.values(indexData.classes);
  const vectors = {};
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    process.stdout.write(`\r  向量化进度: ${i + 1}/${classes.length} ...`);
    const output = await embedder(cls.searchText, {
      pooling: "mean",
      normalize: true,
    });
    vectors[cls.name] = Array.from(output.data);
  }
  process.stdout.write("\n");
  return vectors;
}

async function main() {
  fs.mkdirSync(INDEX_DIR, { recursive: true });

  // 加载多语言向量模型（首次自动下载 ~120MB，缓存在项目 models/ 目录，跨平台一致）
  console.log("加载向量模型（首次运行需下载 ~120MB）...");
  const { pipeline, env } = await import("@huggingface/transformers");
  env.cacheDir = path.join(ROOT, "models"); // 固定缓存路径，避免依赖系统默认目录
  // 支持通过 HF_ENDPOINT 环境变量设置镜像，国内可用 https://hf-mirror.com
  if (process.env.HF_ENDPOINT) {
    const mirror = process.env.HF_ENDPOINT.replace(/\/$/, "") + "/";
    env.remoteHost = mirror;
    console.log(`使用镜像源: ${mirror}`);
  }
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
  );
  console.log("✅ 模型加载完成");

  // 无论 dts/framework/ 是否存在，都生成 framework.json（不存在则为空索引）
  // 确保 searcher.js 启动时能读取到文件
  console.log("开始构建框架索引...");
  const frameworkIndex = {
    version: "1.0.0",
    buildTime: new Date().toISOString(),
    classes: {},
    modules: {},
  };
  if (!fs.existsSync(FRAMEWORK_DTS_DIR)) {
    console.warn("[WARN] dts/framework/ 目录不存在，生成空框架索引");
  } else {
    // 自动扫描 dts/framework/ 下所有 .d.ts 文件，无需手动维护路径列表
    const frameworkDtsPaths = fs
      .readdirSync(FRAMEWORK_DTS_DIR)
      .filter((f) => f.endsWith(".d.ts"))
      .map((f) => path.join(FRAMEWORK_DTS_DIR, f));
    buildIndex(frameworkDtsPaths, null, frameworkIndex);
  }
  fs.writeFileSync(
    path.join(INDEX_DIR, "framework.json"),
    JSON.stringify(frameworkIndex, null, 2),
  );
  console.log(
    `✅ framework.json: ${Object.keys(frameworkIndex.classes).length} 个类`,
  );

  console.log("生成框架向量索引...");
  const frameworkVectors = await buildVectors(frameworkIndex, embedder);
  fs.writeFileSync(
    path.join(INDEX_DIR, "framework-vectors.json"),
    JSON.stringify(frameworkVectors),
  );
  console.log("✅ framework-vectors.json");

  console.log("开始构建 Cocos 索引...");
  const cocosIndex = {
    version: "3.8.8",
    buildTime: new Date().toISOString(),
    classes: {},
    modules: {},
  };
  buildIndex([COCOS_DTS_PATH], "cocos", cocosIndex);
  fs.writeFileSync(
    path.join(INDEX_DIR, "cocos.json"),
    JSON.stringify(cocosIndex, null, 2),
  );
  console.log(`✅ cocos.json: ${Object.keys(cocosIndex.classes).length} 个类`);

  console.log("生成 Cocos 向量索引（类较多，需要几分钟）...");
  const cocosVectors = await buildVectors(cocosIndex, embedder);
  fs.writeFileSync(
    path.join(INDEX_DIR, "cocos-vectors.json"),
    JSON.stringify(cocosVectors),
  );
  console.log("✅ cocos-vectors.json");
}

main().catch(console.error);
