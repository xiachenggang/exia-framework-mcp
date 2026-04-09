import { GComponent } from 'fairygui-cc';
import { JsonAsset } from 'cc';
import { Module } from '@xiacg/exia-core';

/** 窗口显示时，对其他窗口的隐藏处理类型 */
declare enum WindowType {
    /** 不做任何处理 */
    Normal = 0,
    /** 关闭所有 */
    CloseAll = 1,
    /** 关闭上一个 */
    CloseOne = 2,
    /** 隐藏所有 */
    HideAll = 4,
    /** 隐藏上一个 */
    HideOne = 8
}
/** 窗口适配类型，默认全屏 */
declare enum AdapterType {
    /** 全屏适配 */
    Full = 0,
    /** 空出刘海 */
    Bang = 1,
    /** 固定的 不适配 */
    Fixed = 2
}
/**
 * 窗口属性基类
 */
interface IDecoratorInfo {
    /** 构造函数 */
    ctor: any;
    /** 属性 */
    props: Record<string, 1>;
    /** 方法 */
    callbacks: Record<string, Function>;
    /** 控制器 */
    controls: Record<string, 1>;
    /** 动画 */
    transitions: Record<string, 1>;
    res: {
        /** fgui包名 */
        pkg: string;
        /** 组件名 */
        name: string;
        /** 窗口组名称 可选(只有窗口才会设置) */
        group?: string;
        /** 内联的包名 当前界面需要引用其他包中的资源时使用 (只有窗口才会设置) */
        inlinePkgs?: string[];
    };
}

/**
 * @Description: 窗口顶边资源栏
 */
interface IHeader<T = any> {
    /** 资源栏名称 */
    name: string;
    /** 窗口适配类型 */
    adapterType: AdapterType;
    /**
     * 是否显示中
     */
    isShowing(): boolean;
}

declare abstract class Header<T = any> extends GComponent implements IHeader<T> {
    /** 窗口适配类型 */
    adapterType: AdapterType;
    protected abstract onInit(): void;
    protected abstract onShow(userdata?: T): void;
    protected onAdapted(): void;
    protected onClose(): void;
    protected onHide(): void;
    protected onShowFromHide(): void;
    /**
     * 是否显示中
     */
    isShowing(): boolean;
}

/**
 * @Description: 窗口顶部资源栏信息
 */

/**
 * 从 Header 类型中提取 UserData 类型
 */
type ExtractHeaderUserData<T> = T extends Header<infer U> ? U : any;
/**
 * 从 Header 构造函数中提取 Header 实例类型
 */
type ExtractHeaderInstance<T> = T extends new () => infer R ? R : never;
declare class HeaderInfo<T> {
    /** header名字 */
    name: string;
    /**
     * 创建 HeaderInfo (类型安全)
     * @param ctor Header类构造函数
     * @param userdata 自定义数据
     * @returns {HeaderInfo}
     */
    static create<T extends new () => Header<any>>(ctor: T, userdata?: ExtractHeaderUserData<ExtractHeaderInstance<T>>): HeaderInfo<ExtractHeaderUserData<ExtractHeaderInstance<T>>>;
    /**
     * 通过名称创建 HeaderInfo (非类型安全)
     * @param name header名称
     * @param userdata 自定义数据
     * @returns {HeaderInfo}
     */
    static createByName<T = any>(name: string, userdata?: T): HeaderInfo<T>;
}

interface IWindow<TUserData = any, THeaderData = any> {
    /** 窗口名称 */
    name: string;
    /** 窗口类型 */
    type: WindowType;
    /** 窗口适配类型 */
    adapterType: AdapterType;
    /** 底部遮罩的透明度 */
    bgAlpha: number;
    /**
     * 窗口是否显示
     */
    isShowing(): boolean;
    /**
     * 窗口是否在最上层
     *
     */
    isTop(): boolean;
    /** 获取资源栏数据 */
    getHeaderInfo(): HeaderInfo<any>;
    /** 刷新资源栏 */
    refreshHeader(): void;
}

/**
 * @Description: 窗口组 (在同一个窗口容器的上的窗口)
 */

declare class WindowGroup {
    /**
     * 获取窗口组的名称。
     * @returns {string} 窗口组的名称。
     */
    get name(): string;
    /** 获取窗口组的根节点 */
    get root(): GComponent;
    /**
     * 获取当前窗口组中窗口的数量。
     * @returns 窗口数量
     */
    get size(): number;
    /** 获取窗口组中窗口的名称列表 */
    get windowNames(): string[];
    /**
     * 获取是否忽略查询的状态。
     * @returns {boolean} 如果忽略查询，则返回 true，否则返回 false。
     */
    get isIgnore(): boolean;
    /**
     * 处理index下层窗口的隐藏状态的私有方法。递归调用
     * @param index - 窗口索引
     */
    private processWindowHideStatus;
    hasWindow(name: string): boolean;
    /**
     * 获取窗口组顶部窗口实例
     * @returns {IWindow} 顶部窗口实例
     */
    getTopWindow<T extends IWindow>(): T;
}

/**
 * @Description: 窗口基类和fgui组件对接
 */

declare abstract class WindowBase<T = any, U = any> extends GComponent implements IWindow<T, U> {
    /** 窗口类型 */
    type: WindowType;
    /** 窗口适配类型 */
    adapterType: AdapterType;
    /** 底部遮罩的透明度 */
    bgAlpha: number;
    isShowing(): boolean;
    /** 是否在最上层显示 (除忽略的窗口组外, 显示到最上层时) */
    isTop(): boolean;
    /**
     * 获取窗口顶部资源栏数据 默认返回空数组
     * @returns {HeaderInfo}
     */
    abstract getHeaderInfo(): HeaderInfo<any>;
    /**
     * 刷新顶部资源栏
     * 调用这个方法会重新创建 或者 刷新header
     * 用来在同一个界面显示不同的header
     */
    refreshHeader(): void;
    /**
     * 用于在界面中关闭自己
     */
    protected removeSelf(): void;
    protected abstract onAdapted(): void;
    protected abstract onInit(): void;
    protected abstract onClose(): void;
    protected abstract onShow(userdata?: T): void;
    protected abstract onShowFromHide(): void;
    protected abstract onHide(): void;
    protected abstract onToTop(): void;
    protected abstract onToBottom(): void;
    protected abstract onEmptyAreaClick(): void;
}

declare abstract class Window<T = any, U = any> extends WindowBase<T, U> {
    protected onAdapted(): void;
    protected abstract onInit(): void;
    protected abstract onClose(): void;
    protected abstract onShow(userdata?: T): void;
    protected onHide(): void;
    protected onShowFromHide(): void;
    protected onToTop(): void;
    protected onToBottom(): void;
    /**
     * 空白区域点击事件处理函数。
     * 当用户点击窗口的空白区域时触发此方法。
     */
    protected onEmptyAreaClick(): void;
    /**
     * 获取窗口顶部资源栏数据 默认返回空数组
     * @returns {HeaderInfo}
     */
    getHeaderInfo(): HeaderInfo<any>;
}

/**
 * @Description: 属性辅助类
 */
interface IPropsConfig {
    [packageName: string]: {
        [componentName: string]: IPropsInfo;
    };
}
interface IPropsInfo {
    props: (string | number)[];
    callbacks: (string | number)[];
    controls: string[];
    transitions: string[];
}

/**
 * @Description: 窗口管理类
 */

/**
 * 从窗口类型中提取 UserData 类型
 */
type ExtractUserData<T> = T extends Window<infer U, any> ? U : any;
/**
 * 从窗口构造函数中提取窗口实例类型
 */
type ExtractWindowInstance<T> = T extends new () => infer R ? R : never;
declare class WindowManager {
    private static _bgAlpha;
    private static _bgColor;
    /**
     * 添加手动管理资源加载 和 卸载的包名
     * @param pkgName 包名
     */
    static addManualPackage(pkgName: string): void;
    /**
     * 提供一种特殊需求 用来手动设置包所在的 bundle名 以及包在bundle中的路径
     * @param name 窗口名称
     * @param bundleName bundle名 默认: resources
     * @param path 包在bundle中的路径 默认: ui目录
     */
    static setPackageInfo(pkgName: string, bundleName?: string, path?: string): void;
    /**
     * 用于手动设置UI导出数据
     * @param config UI导出数据
     */
    static setUIConfig(config: IPropsConfig): void;
    /**
     * 设置UI包加载相关回调函数
     * @param callbacks 包含加载回调的对象
     * @param callbacks.showWaitWindow 显示加载等待窗的回调
     * @param callbacks.hideWaitWindow 隐藏加载等待窗的回调
     * @param callbacks.fail 打开窗口时资源加载失败的回调 code( 1:bundle加载失败 2:包加载失败 )
     */
    static setPackageCallbacks(callbacks: {
        showWaitWindow: () => void;
        hideWaitWindow: () => void;
        fail: (windowName: string, code: 1 | 2, message: string) => void;
    }): void;
    /**
     * 异步打开一个窗口 (如果UI包的资源未加载, 会自动加载 可以配合 WindowManager.setPackageCallbacks一起使用)
     * @param 窗口类
     * @param userdata 用户数据
     */
    static showWindow<T extends new () => Window<any, any>>(window: T, userdata?: ExtractUserData<ExtractWindowInstance<T>>): Promise<ExtractWindowInstance<T>>;
    /**
     * 关闭一个窗口
     * @param ctor 窗口类
     */
    static closeWindow<T extends new () => IWindow>(window: T): void;
    /**
     * 通过窗口名称关闭一个窗口
     * @param name 窗口名称
     */
    static closeWindowByName(name: string): void;
    /**
     * 是否存在窗口
     * @param name 窗口名称
     */
    static hasWindow(name: string): boolean;
    /**
     * 根据窗口名称获取窗口实例。
     * @template T 窗口类型，必须继承自IWindow接口。
     * @param name 窗口名称
     * @returns 如果找到窗口，则返回对应类型的窗口实例；否则返回null。
     */
    static getWindow<T extends IWindow>(name: string): T | undefined;
    /**
     * 获取当前最顶层的窗口实例。
     * 默认会忽略掉忽略查询的窗口组
     * @returns {T | null} - 返回最顶层的窗口实例，如果没有找到则返回 null。
     */
    static getTopWindow<T extends IWindow, U>(isAll?: boolean): T | null;
    /**
     * 获取所有窗口组的名称列表（按层级顺序）
     * @returns 窗口组的名称列表
     */
    static getGroupNames(): string[];
    /**
     * 根据给定的组名获取窗口组。如果组不存在，则抛出错误。
     * @param name 窗口组名称
     * @returns 返回找到的窗口组。
     */
    static getWindowGroup(name: string): WindowGroup;
    /**
     * 关闭所有窗口
     * @param ignores 不关闭的窗口
     */
    static closeAllWindow(ignores?: IWindow[]): void;
    /**
     * 释放不再使用中的自动加载的UI资源
     * 针对在 UIModule 中设置了不自动释放资源的场景
     */
    static releaseUnusedRes(): void;
}

/**
 * @Description: UI 装饰器
 */

declare namespace _uidecorator {
    /** 获取窗口注册信息 */
    function getWindowMaps(): Map<any, IDecoratorInfo>;
    /** 获取组件注册信息 */
    function getComponentMaps(): Map<any, IDecoratorInfo>;
    /** 获取header注册信息 */
    function getHeaderMaps(): Map<any, IDecoratorInfo>;
    /**
     * 窗口装饰器
     * @param {string} groupName 窗口组名称
     * @param {string} pkgName fgui包名
     * @param {string} name 窗口名 (与fgui中的组件名一一对应)
     * @param {string[] | string} inlinePkgs 内联的包名 当前界面需要引用其他包中的资源时使用 引用多个包用数组 引用单个包用字符串
     *
     * @example @uiclass("窗口组", "UI包名", "MyWindow", ["包名1", "包名2"])
     * @example @uiclass("窗口组", "UI包名", "MyWindow", "包名1")
     */
    function uiclass(groupName: string, pkgName: string, name: string, inlinePkgs?: string[] | string): Function;
    /**
     * UI组件装饰器
     * @param {string} pkg 包名
     * @param {string} name 组件名
     */
    function uicom(pkg: string, name: string): Function;
    /**
     * UI header装饰器
     * @param {string} pkg 包名
     * @param {string} name 组件名
     */
    function uiheader(pkg: string, name: string): Function;
    /**
     * UI属性装饰器
     * @param {Object} target 实例成员的类的原型
     * @param {string} name 属性名
     *
     * example: @uiprop node: GObject
     */
    function uiprop(target: Object, name: string): any;
    /**
     * UI控制器装饰器
     * @param {Object} target 实例成员的类的原型
     * @param {string} name 属性名
     *
     * example: @uicontrol node: GObject
     */
    function uicontrol(target: Object, name: string): any;
    /**
     * UI动画装饰器
     * @param {Object} target 实例成员的类的原型
     * @param {string} name 属性名
     *
     * example: @uitransition node: GObject
     */
    function uitransition(target: Object, name: string): any;
    /**
     * 方法装饰器 (给点击事件用)
     * @param {Object} target 实例成员的类的原型
     * @param {string} name 方法名
     */
    function uiclick(target: Object, name: string, descriptor: PropertyDescriptor): void;
}

/**
 * @Description: cocos UI模块
 */

declare class UIModule extends Module {
    ui_config: JsonAsset;
    bgAlpha: number;
    autoReleaseUIRes: boolean;
    /** 模块名称 */
    moduleName: string;
    onInit(): void;
}

export { AdapterType, Header, HeaderInfo, UIModule, Window, WindowGroup, WindowManager, WindowType, _uidecorator };
