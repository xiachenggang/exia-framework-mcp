'use strict';

const fs = require('fs');
const path = require('path');

/** 余弦相似度（向量已归一化，直接点积即可） */
function cosineSimilarity(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
}

class Searcher {
    constructor() {
        const ROOT = path.resolve(__dirname, '..');
        try {
            this.frameworkIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'index/framework.json'), 'utf-8'));
            this.cocosIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'index/cocos.json'), 'utf-8'));
            this.frameworkVectors = JSON.parse(fs.readFileSync(path.join(ROOT, 'index/framework-vectors.json'), 'utf-8'));
            this.cocosVectors = JSON.parse(fs.readFileSync(path.join(ROOT, 'index/cocos-vectors.json'), 'utf-8'));
        } catch (e) {
            console.error('❌ 索引文件不存在，请先运行 npm run sync 构建索引');
            process.exit(1);
        }
        // 向量模型懒加载，首次 search_api 调用时初始化
        this._embedder = null;
    }

    async _getEmbedder() {
        if (!this._embedder) {
            const { pipeline, env } = await import('@huggingface/transformers');
            env.cacheDir = path.join(__dirname, '..', 'models');   // 固定缓存路径，跨平台一致
            // 支持通过 HF_ENDPOINT 环境变量设置镜像，国内可用 https://hf-mirror.com
            if (process.env.HF_ENDPOINT) {
                env.remoteHost = process.env.HF_ENDPOINT.replace(/\/$/, '') + '/';
            }
            this._embedder = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
        }
        return this._embedder;
    }

    _vectorSearch(queryVec, vectors, index) {
        return Object.entries(vectors)
            .map(([name, vec]) => ({
                score: cosineSimilarity(queryVec, vec),
                item: index.classes[name],
            }));
    }

    /**
     * 向量语义搜索：中文查询可命中英文 API，英文查询可命中中文描述
     * 首次调用时懒加载向量模型（约 2-5 秒），之后复用缓存
     * framework 和 cocos 的候选项合并后全局排序，取 top limit
     * threshold：余弦相似度阈值，低于此值视为不相关，默认 0.3
     */
    async search(query, source = 'all', limit = 10, threshold = 0.3) {
        const embedder = await this._getEmbedder();
        const output = await embedder(query, { pooling: 'mean', normalize: true });
        const queryVec = Array.from(output.data);

        const candidates = [];
        if (source === 'framework' || source === 'all') {
            candidates.push(...this._vectorSearch(queryVec, this.frameworkVectors, this.frameworkIndex));
        }
        if (source === 'cocos' || source === 'all') {
            candidates.push(...this._vectorSearch(queryVec, this.cocosVectors, this.cocosIndex));
        }
        return candidates
            .filter(s => s.score >= threshold)   // 过滤低相关度结果，避免返回无意义匹配
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(s => s.item);
    }

    getModule(moduleName) {
        const index = moduleName === 'cocos' ? this.cocosIndex : this.frameworkIndex;
        const classNames = index.modules[moduleName];
        if (!classNames) return `模块 "${moduleName}" 不存在`;

        const lines = [`# 模块：${moduleName}\n`, `包含 ${classNames.length} 个类/接口：\n`];
        for (const name of classNames) {
            const cls = index.classes[name];
            lines.push(`## ${name}`);
            if (cls.description) lines.push(cls.description);
            lines.push(`方法：${cls.methods.map(m => m.name).join(', ')}\n`);
        }
        return lines.join('\n');
    }

    getClass(className) {
        const cls = this.frameworkIndex.classes[className] ?? this.cocosIndex.classes[className];
        if (!cls) return `类 "${className}" 不存在`;

        const lines = [
            `# ${cls.name}`,
            `模块：${cls.module}`,
            cls.extends ? `继承：${cls.extends}` : '',
            cls.description ? `\n${cls.description}` : '',
            '\n## 属性',
            ...cls.properties.map(p => `- **${p.name}**: \`${p.type}\` ${p.description}`),
            '\n## 方法',
            ...cls.methods.map(m => `### ${m.name}\n\`\`\`javascript\n${m.signature}\n\`\`\`\n${m.description}`),
        ];
        return lines.filter(Boolean).join('\n');
    }

    getMethod(className, methodName) {
        const cls = this.frameworkIndex.classes[className] ?? this.cocosIndex.classes[className];
        if (!cls) return `类 "${className}" 不存在`;

        const method = cls.methods.find(m => m.name === methodName);
        if (!method) return `方法 "${methodName}" 在 "${className}" 中不存在`;

        return [
            `# ${className}.${methodName}`,
            `\`\`\`javascript\n${method.signature}\n\`\`\``,
            method.description,
        ].join('\n\n');
    }
}

module.exports = { Searcher };
