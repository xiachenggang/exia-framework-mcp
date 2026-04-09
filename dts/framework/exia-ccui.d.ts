import { Component, Node } from 'cc';
import { Module } from '@xiacg/exia-core';

/** 窗口显示时对其他窗口的处理方式 */
declare enum WindowType {
    Normal = 0,
    CloseAll = 1,
    CloseOne = 2,
    HideAll = 4,
    HideOne = 8
}
/** 窗口适配类型 */
declare enum AdapterType {
    /** 全屏适配 */
    Full = 0,
    /** 刘海屏安全区 */
    Bang = 1,
    /** 固定尺寸，不适配 */
    Fixed = 2
}
/** 装饰器注册信息 */
interface IDecoratorInfo {
    ctor: any;
    /** propName → nodePath */
    props: Record<string, string>;
    /** nodePath → handler */
    callbacks: Record<string, Function>;
    /** propName → animClipName */
    transitions: Record<string, string>;
    res: {
        /** Cocos 预制体路径（在 bundle 内，不含扩展名） e.g. "ui/ShopWindow" */
        prefabPath: string;
        /** 窗口注册名（同类名） */
        name: string;
        /** 窗口组名（仅 Window 有） */
        group?: string;
        /** 所在 bundle，默认 "resources" */
        bundleName?: string;
        /** 额外需要同步加载的预制体路径列表 */
        inlinePrefabPaths?: string[];
    };
}

interface IHeader<T = any> {
    name: string;
    adapterType: AdapterType;
    isShowing(): boolean;
}

/**
 * @Description: 顶部资源栏基类（替换 GComponent → Component）
 */

declare abstract class Header<T = any> extends Component implements IHeader<T> {
    adapterType: AdapterType;
    get name(): string;
    set name(v: string);
    isShowing(): boolean;
    protected abstract onInit(): void;
    protected abstract onShow(userdata?: T): void;
    protected onAdapted(): void;
    protected onClose(): void;
    protected onHide(): void;
    protected onShowFromHide(): void;
}

/**
 * @Description: 顶部资源栏数据载体
 */

type ExtractHeaderUserData<T> = T extends Header<infer U> ? U : any;
type ExtractHeaderInstance<T> = T extends new () => infer R ? R : never;
declare class HeaderInfo<T> {
    name: string;
    /**
     * 类型安全工厂方法
     * @param ctor    Header 构造函数（需已注册 @uiheader 装饰器）
     * @param userdata 传递给 Header.onShow 的自定义数据
     */
    static create<T extends new () => Header<any>>(ctor: T, userdata?: ExtractHeaderUserData<ExtractHeaderInstance<T>>): HeaderInfo<ExtractHeaderUserData<ExtractHeaderInstance<T>>>;
    /**
     * 非类型安全工厂方法（适用于字符串名称动态创建）
     */
    static createByName<T = any>(name: string, userdata?: T): HeaderInfo<T>;
}

interface IWindow<TUserData = any, THeaderData = any> {
    name: string;
    type: WindowType;
    adapterType: AdapterType;
    bgAlpha: number;
    isShowing(): boolean;
    isTop(): boolean;
    getHeaderInfo(): HeaderInfo<any>;
    refreshHeader(): void;
}

/**
 * @Description: 核心类型定义
 */
interface IWindowInfo {
    ctor: any;
    /** 窗口组名 */
    group: string;
    /** 预制体路径（bundle 内，不含扩展名） */
    prefabPath: string;
    /** 所在 bundle，默认 "resources" */
    bundleName: string;
    /** 窗口注册名 */
    name: string;
    /** 需要同步加载的额外预制体路径 */
    inlinePrefabPaths: string[];
}

/**
 * @Description: 窗口组
 */

declare class WindowGroup {
    get name(): string;
    get root(): Node;
    get size(): number;
    get windowNames(): string[];
    get isIgnore(): boolean;
    constructor(name: string, root: Node, ignoreQuery: boolean, swallowTouch: boolean);
    showWindow<T = any, U = any>(info: IWindowInfo, userdata?: T): Promise<IWindow<T, U>>;
    /**
     * 从已加载的 Prefab 实例化窗口，挂载到当前组的根节点
     */
    private _createWindow;
    private _showAdjustment;
    private _moveWindowToTop;
    private _processWindowHideStatus;
    private _processWindowCloseStatus;
    removeWindow(name: string): void;
    closeAllWindow(ignores?: IWindow[]): void;
    hasWindow(name: string): boolean;
    getTopWindow<T extends IWindow>(): T | null;
}

/**
 * @Description: 窗口基类
 */

declare abstract class WindowBase<T = any, U = any> extends Component implements IWindow<T, U> {
    /** 窗口类型：显示时对其他窗口的处理方式 */
    type: WindowType;
    /** 窗口适配类型 */
    adapterType: AdapterType;
    /** 背景遮罩透明度（0 = 无遮罩） */
    bgAlpha: number;
    get name(): string;
    set name(v: string);
    private _onEmptyAreaTap;
    isShowing(): boolean;
    isTop(): boolean;
    /** 供 WindowManager 屏幕 resize 时调用 */
    screenResize(): void;
    abstract getHeaderInfo(): HeaderInfo<any> | null;
    /**
     * 刷新/切换顶部 Header
     * 在同一窗口需要显示不同 Header 时调用（如 Tab 切换）
     */
    refreshHeader(): void;
    /** 在窗口内部关闭自己，无需持有 WindowManager 引用 */
    protected removeSelf(): void;
    /** 窗口首次初始化（@uiprop 绑定已完成，可安全访问子节点） */
    protected abstract onInit(): void;
    /** 窗口关闭前（清理定时器、取消事件订阅等） */
    protected abstract onClose(): void;
    /** 窗口显示，携带 userdata */
    protected abstract onShow(userdata?: T): void;
    /** 屏幕适配完成后（可在此做自定义布局微调） */
    protected abstract onAdapted(): void;
    /** 窗口被隐藏（HideOne / HideAll 触发） */
    protected abstract onHide(): void;
    /** 从隐藏状态恢复（无新 userdata） */
    protected abstract onShowFromHide(): void;
    /** 回到最顶层（可恢复音效/动画等） */
    protected abstract onToTop(): void;
    /** 被上层窗口覆盖（可暂停音效/动画等） */
    protected abstract onToBottom(): void;
    /** 点击窗口空白背景区域 */
    protected abstract onEmptyAreaClick(): void;
}

/**
 * @Description: 业务窗口基类
 *
 * 将 WindowBase 中的非必须抽象方法提供空实现，
 * 业务代码只需实现 onInit / onClose / onShow 三个方法。
 */

declare abstract class Window<T = any, U = any> extends WindowBase<T, U> {
    protected abstract onInit(): void;
    protected abstract onClose(): void;
    protected abstract onShow(userdata?: T): void;
    protected onAdapted(): void;
    protected onHide(): void;
    protected onShowFromHide(): void;
    protected onToTop(): void;
    protected onToBottom(): void;
    protected onEmptyAreaClick(): void;
    /**
     * 返回 null 表示该窗口不使用顶部 Header。
     * 覆写此方法并返回 HeaderInfo 实例即可启用 Header 复用。
     */
    getHeaderInfo(): HeaderInfo<any> | null;
}

/**
 * @Description: 全局窗口管理器
 *  - 半透明遮罩： Node + Graphics 组件
 *  - adjustAlphaGraph 使用 graphics.clear() / fillColor / rect / fill()
 *  - 通知所有窗口调用 screenResize（原版相同逻辑）
 */

type ExtractUserData<T> = T extends Window<infer U, any> ? U : any;
type ExtractWindowInstance<T> = T extends new () => infer R ? R : never;
declare class WindowManager {
    private static _bgAlpha;
    private static _bgColor;
    private static _overlayGraphics;
    private static _groupNames;
    static get bgAlpha(): number;
    static set bgAlpha(v: number);
    static setPackageCallbacks(callbacks: {
        showWaitWindow: () => void;
        hideWaitWindow: () => void;
        fail: (windowName: string, code: 1 | 2, message: string) => void;
    }): void;
    static addManualPath(prefabPath: string): void;
    /**
     * 设置预制体所在的 bundle 名（特殊需求，覆盖 @uiclass 中声明的 bundleName）
     */
    static setPackageInfo(prefabPath: string, bundleName: string): void;
    static getWindowGroup(name: string): WindowGroup;
    static getGroupNames(): string[];
    /**
     * 异步打开窗口（自动加载 Prefab 资产）
     * @param windowClass 窗口类（构造函数，非实例）
     * @param userdata    传递给 onShow 的数据
     */
    static showWindow<T extends new () => Window<any, any>>(windowClass: T, userdata?: ExtractUserData<ExtractWindowInstance<T>>): Promise<ExtractWindowInstance<T>>;
    static closeWindow<T extends new () => IWindow>(windowClass: T): void;
    static closeWindowByName(name: string): void;
    static closeAllWindow(ignores?: IWindow[]): void;
    static hasWindow(name: string): boolean;
    static getWindow<T extends IWindow>(name: string): T | undefined;
    static getTopWindow<T extends IWindow, U>(isAll?: boolean): T | null;
    static releaseUnusedRes(): void;
}

/**
 * @Description: UI 装饰器（纯 TypeScript）
 *
 * 变化说明：
 *  - @uiclass  第二参数由 pkgName 改为 prefabPath（Cocos bundle 内路径，不含扩展名）
 *  - @uiprop   改为工厂形式 @uiprop() 或 @uiprop('nodePath')，支持层级路径
 *  - @uiclick  改为工厂形式 @uiclick('nodePath')，显式指定按钮节点路径
 *  - @uitransition 改为工厂形式 @uitransition('animClipName')
 */

declare namespace _uidecorator {
    function getWindowMaps(): Map<any, IDecoratorInfo>;
    function getComponentMaps(): Map<any, IDecoratorInfo>;
    function getHeaderMaps(): Map<any, IDecoratorInfo>;
    /**
     * 窗口装饰器
     * @param groupName       窗口组名
     * @param prefabPath      预制体在 bundle 内的路径（不含扩展名），如 "ui/ShopWindow"
     * @param name            注册名（与类名相同，用于防混淆）
     * @param inlinePrefabPaths 额外需要提前加载的预制体路径列表（动态 instantiate 的子预制体）
     * @param bundleName      所在 bundle，默认 "resources"
     *
     * @example
     * @uiclass("MainGroup", "ui/ShopWindow", "ShopWindow")
     * @uiclass("MainGroup", "ui/ShopWindow", "ShopWindow", ["ui/ItemCell"], "mainBundle")
     */
    function uiclass(groupName: string, prefabPath: string, name: string, inlinePrefabPaths?: string[] | string, bundleName?: string): Function;
    /**
     * UI 自定义组件装饰器
     * @param prefabPath 预制体路径
     * @param name       注册名
     * @param bundleName 所在 bundle
     */
    function uicom(prefabPath: string, name: string, bundleName?: string): Function;
    /**
     * Header 装饰器
     * @param prefabPath 预制体路径
     * @param name       注册名
     * @param bundleName 所在 bundle
     */
    function uiheader(prefabPath: string, name: string, bundleName?: string): Function;
    /**
     * UI 节点属性装饰器（工厂形式）
     * 通过 PropsHelper 在 onInit 前自动将子节点赋值到该属性。
     *
     * @param nodePath 子节点路径（相对于窗口根节点），省略时使用属性名
     *
     * @example
     * @uiprop()                  // 查找名为 "btnClose" 的子节点
     * btnClose: Node;
     *
     * @uiprop('Panel/BtnClose')  // 按路径查找
     * btnClose: Node;
     */
    function uiprop(nodePath?: string): (target: Object, propName: string) => void;
    /**
     * 点击事件装饰器（工厂形式）
     * 在 PropsHelper 序列化时自动为指定节点绑定 Button.EventType.CLICK 或 TOUCH_END。
     *
     * @param nodePath 按钮节点路径（相对于窗口根节点）
     *
     * @example
     * @uiclick('btnClose')
     * onBtnCloseClick(): void { this.removeSelf(); }
     *
     * @uiclick('Panel/BtnConfirm')
     * onConfirm(): void { ... }
     */
    function uiclick(nodePath: string): (target: Object, _name: string, descriptor: PropertyDescriptor) => void;
    /**
     * 动画装饰器（工厂形式）
     * 将指定动画 clip 名对应的 AnimationState 赋值到属性。
     *
     * @param clipName Animation 组件中的 clip 名称，省略时使用属性名
     *
     * @example
     * @uitransition()          // clip 名 = "openAnim"
     * openAnim: AnimationState;
     *
     * @uitransition('open')    // clip 名 = "open"
     * openAnim: AnimationState;
     */
    function uitransition(clipName?: string): (target: Object, propName: string) => void;
}

/**
 * @Description: 窗口容器组件
 * 在编辑器场景中，为每个 UI 层（如 Normal / PopUp / Top）挂载一个此组件。
 * UIModule.onInit 遍历子节点中的 CocosWindowContainer，并依次调用 init(uiRoot)。
 * 每个容器对应一个 WindowGroup，负责管理同层窗口的堆叠和显示。
 */

declare class CocosWindowContainer extends Component {
    ignoreQuery: boolean;
    swallowTouch: boolean;
}

/**
 * @Description: UI 模块（Cocos Component 入口）
 *  - 自建 uiRoot Node
 *  - 半透明遮罩： Node + Graphics 组件，通过 WindowManager.setOverlayNode 注入
 *  - 移除 ui_config（IPropsConfig）字段 —— 新版 @uiprop 装饰器直接绑定，无需编辑器导出 JSON
 *  - 屏幕 resize 监听、遍历 CocosWindowContainer
 */

declare class UIModule extends Module {
    bgAlpha: number;
    autoReleaseUIRes: boolean;
    moduleName: string;
    onInit(): void;
    private _onScreenResize;
}

export { AdapterType, CocosWindowContainer, Header, HeaderInfo, UIModule, Window, WindowGroup, WindowManager, WindowType, _uidecorator };
