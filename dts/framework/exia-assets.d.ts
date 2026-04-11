import { Asset, AssetManager } from 'cc';

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

export { AssetLoader, AssetPool, AssetUtils, ErrorCode };
export type { IAssetConfig };
