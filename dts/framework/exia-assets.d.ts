import { Asset, AssetManager, Component, Color, sp, SpriteFrame } from 'cc';

interface IAssetConfig {
    /** bundle名下的资源路径 必填 */
    path: string;
    /** 资源类型 默认 Asset */
    type?: typeof Asset;
    /** 是否是单个文件 默认是文件夹 */
    isFile?: boolean;
    /** bundle名 默认 resources */
    bundle?: string;
}
/** 资源加载的状态类型 */
declare enum StateType {
    Error = 0,
    Wait = 1,
    Loading = 2,
    Finish = 3
}
declare enum ErrorCode {
    /** 文件加载失败 */
    FileLoadFailed = 1,
    /** 资源包加载失败 */
    BundleLoadFailed = 2
}

declare class AssetInfo implements IAssetConfig {
    /** 固定的属性 */
    get type(): typeof Asset;
    get path(): string;
    get isFile(): boolean;
    get bundle(): string;
    get assetBundle(): AssetManager.Bundle;
    /** 可变的属性 */
    get status(): StateType;
    set status(status: StateType);
}

declare class AssetLoaderAgent {
    /**
     * 设置最大并行数量
     * @param {number} parallel 最大并行数量
     */
    set parallel(parallel: number);
    /**
     * 设置失败重试次数
     * @param {number} retry 失败重试次数 默认: 0
     */
    set retry(retry: number);
    /** 通过索引获取 */
    protected getAssetInfo(index: number): AssetInfo;
    protected downloadFaildAnalysis(): void;
    /**
     * @param res 设置回调函数
     * @param {Function} res.complete 加载完成回调
     * @param {Function} res.fail 加载失败回调
     * @param {Function} res.progress 加载进度回调
     */
    setCallbacks(res: {
        complete: () => void;
        fail?: (code: number, msg: string) => void;
        progress?: (percent: number) => void;
    }): void;
}

declare class AssetLoader extends AssetLoaderAgent {
    constructor(batchName?: string);
    /**
     * 开始加载资源
     * @param {IAssetConfig[]} res.configs 资源配置
     */
    start(assetConfigs: IAssetConfig[]): void;
    private onStart;
    /** 重新加载失败的资源 */
    retryDownLoadFailedAssets(): void;
}

declare class AssetPool {
    /** 添加资源 */
    static add(asset: Asset[] | Asset, bundle?: AssetManager.Bundle, batchName?: string): void;
    private static addToBatch;
    static getAllAssetPaths(): string[];
    /**
     * 检查资源是否存在
     * @param path 资源在bundle下的路径
     * @param bundlename 资源bundle名 默认 resources
     */
    static has(path: string, bundlename?: string): boolean;
    /**
     * 获取资源
     * @param path 资源在bundle下的路径
     * @param bundlename 资源bundle名 默认 resources
     */
    static get<T extends Asset>(path: string, bundlename?: string): T;
    /**
     * 按 uuid 判断资源是否存在
     */
    static hasUUID(uuid: string): boolean;
    /**
     * 按 uuid 获取资源
     */
    static getByUUID<T extends Asset>(uuid: string): T;
    /**
     * 按资源加载批次释放资源
     * @param batchName 资源加载批次名 对应 AssetLoader 实例化时传入的 name
     */
    static releaseBatchAssets(batchName: string): void;
    /**
     * 按资源路径释放资源
     * @param path 资源在bundle下的路径
     * @param bundlename 资源bundle名 默认 resources
     */
    static releasePath(path: string, bundlename?: string): void;
    /**
     * 按 bundle、文件夹和资源类型释放资源
     * @param dir 资源在bundle下的路径
     * @param bundlename 资源bundle名 默认 resources
     * @param asset 资源类型 不传表示所有类型的资源
     */
    static releaseDir(dir: string, bundlename?: string, asset?: typeof Asset): Promise<boolean>;
    /**
     * 按 uuid 释放资源
     */
    static releaseUUID(uuid: string): void;
    /**
     * 释放所有加载的资源
     */
    static releaseAll(): void;
}

declare class AssetUtils {
    /** 获取资源数量 */
    static getResourceCount(dir: string, type: typeof Asset, bundle?: AssetManager.Bundle): number;
    /** 获取资源名称 */
    static getUUIDs(dir: string, type: typeof Asset, bundle?: AssetManager.Bundle): string[];
    /** 加载 bundle */
    static loadBundle(bundlename: string): Promise<AssetManager.Bundle>;
    /**
     * 加载单个资源
     * @param bundle 资源包名或资源包
     * @param path 资源路径
     * @param type 资源类型
     * @param callbacks 回调函数
     */
    static loadFile<T extends typeof Asset>(bundle: string | AssetManager.Bundle, path: string, type: T, callbacks?: {
        complete?: (asset: Asset) => void;
        fail?: (code: ErrorCode, msg: string) => void;
    }): void;
    /**
     * 加载文件夹下的资源
     * @param bundle 资源包名或资源包
     * @param path 资源路径
     * @param type 资源类型
     * @param callbacks 回调函数
     * @param callbacks.progress 进度回调 value: 已完成数量 total: 总数量
     */
    static loadDir<T extends typeof Asset>(bundle: string | AssetManager.Bundle, path: string, type: T, callbacks?: {
        complete?: (assets: Asset[]) => void;
        fail?: (code: ErrorCode, msg: string) => void;
        progress?: (value: number, total: number) => void;
    }): void;
}

interface RetryPolicy {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
}
interface LoadOptions {
    type?: typeof Asset;
    retry?: Partial<RetryPolicy>;
    timeout?: number;
    ext?: string;
}
declare class RemoteAssetManager {
    private static _inst;
    static get instance(): RemoteAssetManager;
    private _cache;
    private _pending;
    private _defaultRetry;
    private _defaultTimeout;
    private _maxCacheSize;
    private constructor();
    configure(opts: {
        retry?: Partial<RetryPolicy>;
        timeout?: number;
        maxCacheSize?: number;
    }): void;
    /**
     * 加载远程资源（唯一入口）
     *
     * 缓存命中  → refCount++ 直接返回
     * 请求去重  → 复用进行中的 Promise，不发新请求
     * 新请求    → 超时保护 + 指数退避重试
     */
    load<T extends Asset>(url: string, options?: LoadOptions): Promise<T>;
    /** 手动增加引用（不触发加载） */
    addRef(url: string, options?: LoadOptions): boolean;
    /** 减少引用，归零时释放底层 Asset */
    release(url: string, options?: LoadOptions): void;
    /** 强制释放（忽略引用计数） */
    forceRelease(url: string, options?: LoadOptions): void;
    /** 释放全部缓存 */
    releaseAll(): void;
    /** 释放空闲超过指定时长且 refCount=0 的条目 */
    releaseIdle(maxIdleMs: number): void;
    has(url: string, opts?: LoadOptions): boolean;
    isLoading(url: string, opts?: LoadOptions): boolean;
    getRefCount(url: string, opts?: LoadOptions): number;
    get cacheCount(): number;
    get pendingCount(): number;
    dump(): any[];
    /** 缓存 key = url + type + ext */
    _key(url: string, opts?: LoadOptions): string;
    private _loadWithRetry;
    private _loadOnce;
    private _estimateSize;
    private _evictLRU;
    private _destroy;
}

declare class RemoteSpriteLoader extends Component {
    initialUrl: string;
    placeholderColor: Color;
    autoLoad: boolean;
    fadeInDuration: number;
    private _sprite;
    private _currentHandle;
    private _currentUrl;
    /** 加载序列号，防止快速切换竞态 */
    private _seq;
    private _loading;
    onLoad(): void;
    onDestroy(): void;
    /** 当前显示的 url */
    get currentUrl(): string;
    /** 是否正在加载中 */
    get isLoading(): boolean;
    /**
     * 加载并切换到新的远程图片
     *
     * 完整流程：
     *  1. 序列号 +1（使旧的进行中请求失效）
     *  2. 显示占位状态
     *  3. 通过 RemoteSpriteManager.acquire 获取 SpriteHandle
     *       └─ 内部调用 RemoteAssetManager.load（去重/重试/缓存）
     *       └─ 内部管理 Texture2D 共享池
     *  4. 序列号校验（若已过期则立即释放刚加载的 handle）
     *  5. 释放旧 handle（三层资源链逐层释放）
     *  6. 应用新 SpriteFrame + 可选淡入动画
     *
     * @returns 是否加载成功
     */
    loadUrl(url: string): Promise<boolean>;
    /**
     * 清空显示并释放资源
     */
    clear(): void;
    /**
     * 强制刷新（清缓存重新下载）
     */
    reload(): Promise<boolean>;
    /**
     * 释放当前持有的 SpriteHandle
     * handle.release() 内部会完成三层释放：
     *   SpriteFrame.destroy → Texture2D 引用-1 → ImageAsset 引用-1
     */
    private _releaseCurrentHandle;
    /** 显示占位状态 */
    private _showPlaceholder;
    /** 将 handle 的 spriteFrame 应用到 Sprite 上 */
    private _applyToSprite;
    /** 简易淡入（避免引入 tween 依赖） */
    private _fadeIn;
}

/** Spine 加载配置 */
interface SpineLoadConfig {
    /** 骨骼数据 URL (.json 或 .skel) */
    skelUrl: string;
    /** Atlas 文件 URL，不传则自动从 skelUrl 推导 */
    atlasUrl?: string;
    /** 纹理基础路径，不传则自动从 atlasUrl 推导 */
    textureBaseUrl?: string;
    /** 重试策略覆盖 */
    retry?: Partial<RetryPolicy>;
    /** 单文件超时 ms */
    timeout?: number;
}
/** acquire 返回给上层的句柄 */
interface SpineHandle {
    /** 配置标识 */
    key: string;
    /** 组装好的 SkeletonData，可直接赋给 sp.Skeleton.skeletonData */
    skeletonData: sp.SkeletonData;
    /** 上层必须调用释放 */
    release: () => void;
}
declare class RemoteSpineManager {
    private static _inst;
    static get instance(): RemoteSpineManager;
    /** key → 共享的 SkeletonData 条目 */
    private _pool;
    /** key → 进行中的加载（去重） */
    private _loading;
    /** 默认重试配置（文本/二进制资源，图片走 RemoteAssetManager 自己的配置） */
    private _defaultRetry;
    private _defaultTimeout;
    private constructor();
    /**
     * 获取远程 Spine 资源
     *
     * 完整流程：
     *  1. 检查池中是否已有 → refCount++ 直接返回
     *  2. 检查是否正在加载 → 复用 Promise（去重）
     *  3. 并行加载三类资源：
     *     · skeleton JSON/Binary → 自带重试的 XHR
     *     · atlas text           → 自带重试的 XHR
     *     · textures (N 张)      → RemoteAssetManager（享受全部能力）
     *  4. 解析 atlas 提取纹理文件名
     *  5. 组装 sp.SkeletonData
     *  6. 返回 SpineHandle（含一次性 release 回调）
     */
    acquire(config: SpineLoadConfig): Promise<SpineHandle>;
    /**
     * 预加载（不占引用）
     */
    preload(config: SpineLoadConfig): Promise<void>;
    getRefCount(config: SpineLoadConfig): number;
    get poolSize(): number;
    dump(): any[];
    /** 强制清空全部 */
    purgeAll(): void;
    private _makeKey;
    /**
     * 执行完整的三阶段加载
     */
    private _doLoad;
    /**
     * 包装为 SpineHandle（含一次性 release）
     */
    private _wrapHandle;
    /**
     * ★ 释放链路 ★
     *
     * refCount-- → 归零后：
     *  1. sp.SkeletonData.destroy()     ← 骨骼数据
     *  2. Texture2D[].forEach(destroy)  ← GPU 显存
     *  3. remoteAssets.release() × N    ← ImageAsset 引用计数
     */
    private _releaseOne;
    private _destroyEntry;
    /**
     * 带重试的 JSON 加载
     */
    private _fetchJson;
    /**
     * 带重试的文本加载
     */
    private _fetchText;
    /**
     * 带重试的二进制加载
     */
    private _fetchBinary;
    /**
     * 通用 XHR 请求 + 指数退避重试
     */
    private _fetchWithRetry;
    private _xhrOnce;
    /**
     * 从 atlas 文本中提取纹理页文件名
     *
     * 兼容 Spine 3.x 和 4.x atlas 格式：
     *   - 非缩进行
     *   - 不含冒号（排除 size: / filter: 等属性行）
     *   - 以图片扩展名结尾
     *
     * 示例 atlas 片段：
     *   hero.png              ← 匹配 ✓
     *   size: 1024,1024       ← 不匹配（含冒号）
     *   filter: Linear,Linear ← 不匹配（含冒号）
     *     rotate: false       ← 不匹配（缩进）
     *   hero2.png             ← 匹配 ✓
     */
    static _parseAtlasPages(atlasText: string): string[];
}

declare class RemoteSpineLoader extends Component {
    initialSkelUrl: string;
    initialAtlasUrl: string;
    autoPlayAnimation: string;
    autoPlayLoop: boolean;
    autoLoad: boolean;
    private _skeleton;
    private _currentHandle;
    private _currentKey;
    private _seq;
    private _loading;
    onLoad(): void;
    onDestroy(): void;
    /** 当前加载的骨骼 key */
    get currentKey(): string;
    /** 是否正在加载 */
    get isLoading(): boolean;
    /** 获取底层 sp.Skeleton 组件 */
    get skeleton(): sp.Skeleton | null;
    /**
     * 加载并切换远程 Spine 资源
     *
     * 流程：
     *  1. 序列号 +1（旧的进行中请求自动失效）
     *  2. RemoteSpineManager.acquire → 并行加载三件套
     *  3. 序列号校验
     *  4. 释放旧 handle（触发三层释放链）
     *  5. 赋值 SkeletonData → 自动播放动画
     *
     * @returns 是否成功
     */
    loadSpine(config: SpineLoadConfig): Promise<boolean>;
    /**
     * 便捷方法：只传 URL
     */
    loadUrl(skelUrl: string, atlasUrl?: string): Promise<boolean>;
    /**
     * 清空显示并释放资源
     */
    clear(): void;
    /**
     * 设置当前动画
     */
    setAnimation(name: string, loop?: boolean, trackIndex?: number): void;
    /**
     * 添加后续动画
     */
    addAnimation(name: string, loop?: boolean, delay?: number, trackIndex?: number): void;
    /**
     * 设置皮肤
     */
    setSkin(skinName: string): void;
    /**
     * 获取所有动画名
     */
    getAnimationNames(): string[];
    /**
     * 强制刷新
     */
    reload(): Promise<boolean>;
    private _releaseCurrentHandle;
    private _applyToSkeleton;
}

/** acquire 返回给上层的句柄 */
interface SpriteHandle {
    url: string;
    spriteFrame: SpriteFrame;
    /** 上层必须调用此方法释放 */
    release: () => void;
}
declare class RemoteSpriteManager {
    private static _inst;
    static get instance(): RemoteSpriteManager;
    /** url → 共享的 Texture2D 条目 */
    private _texPool;
    private constructor();
    /**
     * 获取远程图片的 SpriteFrame
     *
     * 内部流程：
     *  1. 通过 RemoteAssetManager.load 获取 ImageAsset（享受去重/重试/缓存）
     *  2. 查纹理池：有则复用 Texture2D，无则新建
     *  3. 创建独立的 SpriteFrame 返回给调用者
     *  4. 返回 SpriteHandle，内含一次性 release() 回调
     *
     * @param url    CDN 图片地址
     * @param retry  可覆盖重试策略
     */
    acquire(url: string, retry?: LoadOptions['retry']): Promise<SpriteHandle>;
    /**
     * 批量获取
     */
    acquireBatch(urls: string[], onProgress?: (loaded: number, total: number) => void): Promise<SpriteHandle[]>;
    /**
     * 预热（加载到缓存但不占用纹理池引用）
     */
    preload(url: string): Promise<void>;
    /** 某 url 的 Texture2D 引用计数 */
    getTextureRefCount(url: string): number;
    /** 纹理池大小 */
    get poolSize(): number;
    /** 打印池状态 */
    dump(): any[];
    /** 强制清空纹理池 + 底层所有缓存 */
    purgeAll(): void;
    /**
     * 释放单个 SpriteFrame + 对应引用链
     *
     * 释放顺序（由外到内）：
     *  1. SpriteFrame.destroy()       — 调用者独有
     *  2. 纹理池 refCount--
     *     → 归零则 Texture2D.destroy()  — 释放 GPU 显存
     *  3. RemoteAssetManager.release() — ImageAsset refCount--
     *     → 归零则 decRef + releaseAsset
     */
    private _releaseOne;
    static _guessExt(url: string): string;
}

declare class LocalResManager {
    private static _inst;
    static get instance(): LocalResManager;
    /** path|type → 缓存条目 */
    private _cache;
    /** path|type → 进行中请求 */
    private _pending;
    private constructor();
    /**
     * 加载 resources 下的资源
     *
     * @param path  相对于 resources/ 的路径，不含扩展名
     *              例: "textures/hero"  "ui/icons/coin"
     * @param type  资源类型，例: SpriteFrame, Texture2D, SpriteAtlas
     *
     * 流程：
     *  缓存命中  → refCount++ 直接返回
     *  请求去重  → 复用进行中的 Promise
     *  新请求    → resources.load + addRef + 写缓存
     */
    load<T extends Asset>(path: string, type: typeof Asset): Promise<T>;
    /**
     * 加载 SpriteFrame
     *
     * ★ resources 下图片资源的路径规则 ★
     *
     * 文件结构:
     *   assets/resources/textures/hero.png
     *
     * 编辑器导入后引擎自动生成:
     *   hero (ImageAsset)
     *     └─ hero/texture (Texture2D)      ← 子资产
     *         └─ hero/spriteFrame (SpriteFrame) ← 子资产
     *
     * 所以加载 SpriteFrame 的路径是:
     *   "textures/hero/spriteFrame"   ← ✅ 正确
     *   "textures/hero"               ← ❌ 加载的是 ImageAsset
     *
     * 本方法自动补全 "/spriteFrame" 后缀
     */
    loadSpriteFrame(path: string): Promise<SpriteFrame>;
    /**
     * 从 SpriteAtlas 中获取指定帧
     *
     * @param atlasPath 图集路径，例: "ui/common-atlas"
     * @param frameName 帧名称，例: "btn_close"
     */
    loadFromAtlas(atlasPath: string, frameName: string): Promise<SpriteFrame>;
    /**
     * 批量加载 SpriteFrame
     */
    loadSpriteFrames(paths: string[], onProgress?: (loaded: number, total: number) => void): Promise<SpriteFrame[]>;
    /**
     * 加载 resources 下某个目录的全部 SpriteFrame
     *
     * @param dir 目录路径，例: "textures/items"
     */
    loadDir(dir: string): Promise<SpriteFrame[]>;
    /**
     * 预加载（不占引用计数）
     */
    preloadSpriteFrame(path: string): Promise<void>;
    /**
     * 加载 resources 下的 Spine 骨骼数据
     *
     * ★ 本地 Spine 与远程 Spine 的核心区别 ★
     *
     * 远程 Spine（RemoteSpineManager）:
     *   需要自己用 XHR 加载 .json + .atlas + .png
     *   手动 new Texture2D、手动组装 sp.SkeletonData
     *   释放时必须手动 destroy SkeletonData → Texture2D × N → ImageAsset × N
     *
     * 本地 Spine:
     *   编辑器导入 .json + .atlas + .png 后，引擎自动打包成 sp.SkeletonData
     *   内部的 Texture2D / atlas 都是引擎管理的子资产，依赖关系已注册
     *   只需 decRef(sp.SkeletonData) → 引擎自动释放全链
     *   ❌ 绝不要手动 destroy 其内部纹理！
     *
     * 路径规则：
     *   文件: assets/resources/spine/hero/hero.json
     *                                    hero.atlas
     *                                    hero.png
     *   加载路径: "spine/hero/hero"  ← 指向 .json 主文件（不含扩展名）
     *
     * @param path 相对于 resources/ 的路径，不含扩展名
     */
    loadSpineData(path: string): Promise<sp.SkeletonData>;
    /** 释放 Spine 骨骼数据 */
    releaseSpineData(path: string): void;
    /** 预加载 Spine（不占引用计数） */
    preloadSpineData(path: string): Promise<void>;
    /** 批量加载 Spine */
    loadSpineDataBatch(paths: string[], onProgress?: (loaded: number, total: number) => void): Promise<sp.SkeletonData[]>;
    /**
     * ★ resources 资源的正确释放方式 ★
     *
     * 与远程资源完全不同！
     *
     * 远程资源释放（三步手动）:
     *   spriteFrame.destroy()        ← 你 new 的
     *   texture.destroy()            ← 你 new 的
     *   imageAsset.decRef()          ← 引擎的
     *   assetManager.releaseAsset()  ← 引擎的
     *
     * 本地资源释放（只需 decRef）:
     *   spriteFrame.decRef()
     *   → 引擎自动处理：
     *     · 追踪到 Texture2D 依赖 → 减其引用
     *     · 追踪到 ImageAsset 依赖 → 减其引用
     *     · 所有引用归零 → 自动释放全链
     *
     * ❌ 绝对不要这样做：
     *   texture.destroy()   // 会破坏引擎依赖追踪！
     *   spriteFrame.destroy() // 同上！
     *
     * ✅ 只需要：
     *   spriteFrame.decRef()  // 让引擎自己管理
     */
    release(path: string, type: typeof Asset): void;
    /** 释放 SpriteFrame（自动补全路径） */
    releaseSpriteFrame(path: string): void;
    /** 释放图集子帧 */
    releaseAtlasFrame(atlasPath: string, frameName: string): void;
    /** 释放图集本身 */
    releaseAtlas(atlasPath: string): void;
    /** 强制释放（忽略引用计数） */
    forceRelease(path: string, type: typeof Asset): void;
    /** 释放所有缓存 */
    releaseAll(): void;
    /** 释放空闲资源 */
    releaseIdle(maxIdleMs: number): void;
    has(path: string, type: typeof Asset): boolean;
    getRefCount(path: string, type: typeof Asset): number;
    get cacheCount(): number;
    dump(): any[];
    private _key;
    private _doLoad;
    private _releaseByKey;
    /**
     * ★ 本地资源销毁 —— 只 decRef，不 destroy ★
     */
    private _destroy;
}

declare class LocalSpineLoader extends Component {
    initialPath: string;
    autoPlayAnimation: string;
    autoPlayLoop: boolean;
    autoLoad: boolean;
    private _skeleton;
    private _currentHandle;
    private _currentPath;
    private _seq;
    private _loading;
    onLoad(): void;
    onDestroy(): void;
    get currentPath(): string;
    get isLoading(): boolean;
    get skeleton(): sp.Skeleton | null;
    /**
     * 加载并切换 resources/ 下的 Spine 资源
     *
     * @param path 相对于 resources/ 的路径，不含扩展名
     *             例: "spine/hero/hero"
     *
     * 流程：
     *  1. _seq++ 使旧请求失效
     *  2. localRes.loadSpineData(path) 加载（走缓存/去重）
     *  3. 序列号校验
     *  4. _releaseCurrent() 释放旧资源（decRef → 引擎自动链式释放）
     *  5. 赋值 SkeletonData + 自动播放
     */
    loadPath(path: string): Promise<boolean>;
    /**
     * 清空显示并释放
     */
    clear(): void;
    setAnimation(name: string, loop?: boolean, trackIndex?: number): void;
    addAnimation(name: string, loop?: boolean, delay?: number, trackIndex?: number): void;
    setSkin(skinName: string): void;
    getAnimationNames(): string[];
    getSkinNames(): string[];
    reload(): Promise<boolean>;
    /**
     * 释放当前资源
     *
     * ★ 本地 Spine 释放只需 decRef ★
     *
     * localRes.releaseSpineData(path)
     *   → LocalResManager._destroy()
     *     → skeletonData.decRef()
     *       → 引擎自动追踪并释放内部 Texture2D × N + atlas 数据
     *
     * ❌ 绝不要手动 destroy SkeletonData 或其内部纹理
     */
    private _releaseCurrent;
    private _applyToSkeleton;
}

declare class LocalSpriteLoader extends Component {
    initialPath: string;
    autoLoad: boolean;
    private _sprite;
    private _currentHandle;
    private _currentId;
    private _seq;
    private _loading;
    onLoad(): void;
    onDestroy(): void;
    get currentId(): string;
    get isLoading(): boolean;
    /**
     * 加载 resources/ 下的图片并切换 SpriteFrame
     *
     * @param path 相对于 resources/ 的路径，不含扩展名
     *             例: "textures/hero"  "ui/icons/coin"
     *             自动补全 /spriteFrame 后缀
     */
    loadPath(path: string): Promise<boolean>;
    /**
     * 从 SpriteAtlas 图集中加载指定帧
     *
     * @param atlasPath 图集路径，例: "ui/common-atlas"
     * @param frameName 帧名称，例: "btn_close"
     */
    loadFromAtlas(atlasPath: string, frameName: string): Promise<boolean>;
    /**
     * 清空并释放
     */
    clear(): void;
    private _releaseCurrent;
}

export { AssetLoader, AssetPool, AssetUtils, ErrorCode, LocalResManager, LocalSpineLoader, LocalSpriteLoader, RemoteAssetManager, RemoteSpineLoader, RemoteSpineManager, RemoteSpriteLoader, RemoteSpriteManager };
export type { IAssetConfig };
