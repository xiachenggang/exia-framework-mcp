import { Component } from 'cc';

/**
 * 启用或禁用调试模式。
 * @param enable - 如果为 true，则启用调试模式；如果为 false，则禁用调试模式。不设置默认不开启
 */
declare function enableDebugMode(enable: boolean): void;

/**
 * @Description: 适配用的类
 */
declare abstract class Adapter {
    /** 适配器实例 */
    static instance: Adapter;
    /**
     * 添加屏幕尺寸发生变化的监听
     * @param listener 监听器
     */
    addResizeListener(listener: (...args: any) => void): void;
    /**
     * 移除屏幕尺寸发生变化的监听
     * @param listener 监听器
     */
    removeResizeListener(listener: (...args: any) => void): void;
}

/**
 * @Description:cocos游戏入口 定义了游戏启动时的基本配置和初始化流程。
 */

declare abstract class CocosEntry extends Component {
    fps: number;
    enableDebug: boolean;
    /**
     * 虚函数，子类需要实现
     * 自定义库初始化完成后调用
     */
    abstract onInit(): void;
    /**
     * 时间相关
     */
    private initTime;
}

/**
 * @Description: cocos UI模块
 */

declare abstract class Module extends Component {
    /**
     * 模块名称
     * @type {string}
     */
    readonly moduleName: string;
    /**
     * 虚函数，子类需要实现
     * 模块初始化完成后调用的函数
     * @abstract
     */
    protected abstract onInit(): void;
}

/**
 * @Description: 平台相关
 */
declare enum PlatformType {
    /** 安卓平台 */
    Android = 1,
    /** 苹果IOS平台 */
    IOS = 2,
    /** 华为鸿蒙平台 */
    HarmonyOS = 3,
    /** 微信小游戏 */
    WX = 4,
    /** 其他都为Browser */
    Browser = 1001
}
declare class Platform {
    /**
     * 是否为原生平台
     * @type {boolean}
     */
    static isNative: boolean;
    /**
     * 是否为移动平台
     * @type {boolean}
     */
    static isMobile: boolean;
    /**
     * 是否为原生移动平台
     * @type {boolean}
     */
    static isNativeMobile: boolean;
    /**
     * 是否为安卓平台
     * @type {boolean}
     */
    static isAndroid: boolean;
    /**
     * 是否为IOS平台
     * @type {boolean}
     */
    static isIOS: boolean;
    /**
     * 是否为HarmonyOS平台
     * @type {boolean}
     */
    static isHarmonyOS: boolean;
    /**
     * 是否为微信小游戏
     * @type {boolean}
     */
    static isWX: boolean;
    /**
     * 是否为浏览器
     * @type {boolean}
     */
    static isBrowser: boolean;
    /**
     * 平台类型
     * @type {PlatformType}
     */
    static platform: PlatformType;
    /**
     * 设备ID
     * @type {string}
     */
    static deviceId: string;
}

/**
 * @Description: 屏幕尺寸信息接口
 */
declare class Screen {
    /** 屏幕宽度 */
    static ScreenWidth: number;
    /** 屏幕高度 */
    static ScreenHeight: number;
    /** 设计分辨率宽 */
    static DesignWidth: number;
    /** 设计分辨率高 */
    static DesignHeight: number;
    /** 安全区外一侧的高度 或 宽度 */
    static SafeAreaHeight: number;
    /** 安全区的宽度 */
    static SafeWidth: number;
    /** 安全区的高度 */
    static SafeHeight: number;
}

/**
 * @Description: 二进制工具类 - 使用 JavaScript 标准库实现
 */
declare class Binary {
    /**
     * 将对象转换为二进制数据
     */
    static toBinary(obj: any): Uint8Array;
    /**
     * 将二进制数据转换JSON数据
     * @param binary 二进制数据
     * @returns
     */
    static toJson(binary: any): any;
    /**
     * 检查数据是否为二进制格式
     * @param data 要检查的数据
     * @returns 是否为二进制格式
     */
    static isBinaryFormat(data: Uint8Array): boolean;
}

declare function log(...args: any[]): void;
/**
 * 开启debug模式后 输出调试信息
 * @param args
 */
declare function debug(...args: any[]): void;
/**
 * 信息性消息 某些浏览器中会带有小图标，但颜色通常与 log 相同
 * @param args
 */
declare function info(...args: any[]): void;
/**
 * 警告信息 黄色背景，通常带有警告图标
 * @param args
 */
declare function warn(...args: any[]): void;
/**
 * 错误消息 红色背景，通常带有错误图标
 * @param args
 */
declare function error(...args: any[]): void;

/**
 * 对字符串执行md5处理
 *
 * @export
 * @param {string} message 要处理的字符串
 * @returns {string} md5
 */
declare function md5(message: string): string;

declare class Time {
    /** 获取游戏系统启动时间戳 */
    static get osBootTime(): number;
    /** 获取主动设置的网络时间 单位ms */
    static get netTime(): number;
    /** 获取本地时间与网路时间的偏移量 单位ms */
    static get netTimeDiff(): number;
    /** 获取系统运行时间 */
    static get runTime(): number;
    /**
     * 设置网络时间, 单位ms
     * @param netTime 网络时间
     */
    static setNetTime(netTime: number): void;
    /**
     * 获取当前时间 单位ms
     */
    static now(): number;
    /**
     * 将毫秒转换为秒
     * @param ms 毫秒
     */
    static msTos(ms: number): number;
    /**
     * 将秒转换为毫秒
     */
    static sToMs(s: number): number;
    /**
     * 获取年份
     * @param timestamp 时间戳 (ms)
     * @returns 年份
     */
    static getYear(timestamp?: number): number;
    /**
     * 获取月份
     * @param timestamp 时间戳 (ms)
     * @returns 月份
     */
    static getMonth(timestamp?: number): number;
    /**
     * 获取日期
     * @param timestamp 时间戳 (ms)
     * @returns 日期
     */
    static getDay(timestamp?: number): number;
    /**
     * 获取小时
     * @param timestamp 时间戳 (ms)
     * @returns 小时
     */
    static getHour(timestamp?: number): number;
    /**
     * 获取分钟
     * @param timestamp 时间戳 (ms)
     * @returns 分钟
     */
    static getMinute(timestamp?: number): number;
    /**
     * 获取秒
     * @param timestamp 时间戳 (ms)
     * @returns 秒
     */
    static getSecond(timestamp?: number): number;
    /**
     * 获取当天开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getDayStartTime(timestamp?: number): number;
    /**
     * 获取当天的结束时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getDayEndTime(timestamp?: number): number;
    /**
     * 获取传入时间是周几
     * @param {number} [time] (ms)
     * @returns {number}
     */
    static getWeekDay(time?: number): number;
    /**
     * 获取当前周的开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getWeekStartTime(timestamp?: number): number;
    /**
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getWeekEndTime(timestamp?: number): number;
    /**
     * 获取当前月开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getMonthStartTime(timestamp?: number): number;
    /**
     * 获取当前月结束时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getMonthEndTime(timestamp?: number): number;
    /**
     * 获取当前年份开始时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getYearStartTime(timestamp?: number): number;
    /**
     * 获取当前年份结束时间
     * @param timestamp 时间戳 (ms)
     * @returns 时间戳 (ms)
     */
    static getYearEndTime(timestamp?: number): number;
    /**
     * 获取当前月的天数
     * @param timestamp 时间戳 (ms)
     * @returns 天数
     */
    static getMonthDays(timestamp?: number): number;
    /**
     * 是否是同一天
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一天
     */
    static isSameDay(timestamp1: number, now?: number): boolean;
    /**
     * 是否是同一周
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一周
     */
    static isSameWeek(timestamp1: number, now?: number): boolean;
    /**
     * 是否是同一月
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一月
     */
    static isSameMonth(timestamp1: number, now?: number): boolean;
    /**
     * 是否是同一年
     * @param timestamp1 时间戳1 (ms)
     * @param now 时间戳2 (ms) 如果不传，则和当前时间比较
     * @returns 是否是同一年
     */
    static isSameYear(timestamp1: number, now?: number): boolean;
    /**
     * 通用时间格式化方法
     * @param timestamp 时间戳 (ms)
     * @param pattern 格式化模板
     *
     * 支持的占位符(大写补零,小写不补零):
     * - YYYY: 四位年份 (2025) | YY: 两位年份 (25)
     * - MM: 两位月份 (01-12) | M: 月份 (1-12)
     * - DD: 两位日期 (01-31) | D: 日期 (1-31)
     * - hh: 两位小时 (00-23) | h: 小时 (0-23)
     * - mm: 两位分钟 (00-59) | m: 分钟 (0-59)
     * - ss: 两位秒 (00-59) | s: 秒 (0-59)
     *
     * @example
     * Time.format(timestamp, 'YYYY-MM-DD hh:mm:ss') // "2025-01-05 14:30:45"
     * Time.format(timestamp, 'YYYY年MM月DD日 hh:mm') // "2025年01月05日 14:30"
     * Time.format(timestamp, 'M月D日 h时m分') // "1月5日 14时30分"
     */
    static format(timestamp: number, pattern: string): string;
    /**
     * 格式化时间 格式: xxxx-xx-xx hh:mm:ss
     * @param timestamp 时间戳 (ms)
     */
    static formatTime(timestamp: number): string;
    /**
     * 格式化时间 格式: xxxx年xx月xx日 hh:mm:ss
     * @param timestamp 时间戳 (ms)
     */
    static formatTimeChinese(timestamp: number): string;
    /**
     * 通用时长格式化方法
     * @param seconds 时长(秒)
     * @param pattern 格式化模板
     * @param options 格式化选项
     *
     * 支持的占位符(大写补零,小写不补零):
     * - DD/D: 天数
     * - HH/H: 总小时数(可超过24)
     * - hh/h: 小时数(0-23范围)
     * - MM/M: 总分钟数(可超过60)
     * - mm/m: 分钟数(0-59范围)
     * - ss/s: 秒数(0-59范围)
     *
     * options.autoHide: 自动隐藏为0的高位单位(默认false)
     *
     * @example
     * Time.formatDuration(3661, 'HH:mm:ss')     // "01:01:01"
     * Time.formatDuration(3661, 'MM:ss')        // "61:01"
     * Time.formatDuration(3661, 'H小时m分s秒')   // "1小时1分1秒"
     * Time.formatDuration(90061, 'DD天hh:mm:ss') // "1天01:01:01"
     * Time.formatDuration(125, 'HH:mm:ss', { autoHide: true }) // "02:05"
     * Time.formatDuration(3661, 'DD天HH时mm分ss秒', { autoHide: true }) // "1时1分1秒"
     */
    static formatDuration(seconds: number, pattern: string, options?: {
        autoHide?: boolean;
    }): string;
    /**
     * 智能格式化时长 - 自动隐藏为0的高位单位
     * @param time 时间 (s)
     * @param pattern 格式化模板，默认 'D天h小时m分s秒'
     *
     * @example
     * Time.formatSmart(86461)  // "1天1小时1分1秒"
     * Time.formatSmart(3661)   // "1小时1分1秒"
     * Time.formatSmart(61)     // "1分1秒"
     * Time.formatSmart(1)      // "1秒"
     */
    static formatSmart(time: number, pattern?: string): string;
    /**
     * 智能格式化时长(简化版) - 只显示最大的两个单位，较小单位向上取整
     * @param time 时间 (s)
     * @param pattern 格式化模板，默认 'D天h小时|h小时m分|m分s秒'，用 | 分隔不同级别
     *
     * @example
     * Time.formatSmartSimple(90061)  // "1天2小时" (1.04小时向上取整为2)
     * Time.formatSmartSimple(3661)   // "1小时2分" (1.02分钟向上取整为2)
     * Time.formatSmartSimple(61)     // "1分2秒" (1.02秒向上取整为2)
     * Time.formatSmartSimple(1)      // "1秒"
     * Time.formatSmartSimple(90061, 'D天h时|h时m分|m分s秒')  // "1天2时"
     */
    static formatSmartSimple(time: number, pattern?: string): string;
}

declare class Utils {
    /**
     * 版本号比较
     * @param version1 本地版本号
     * @param version2 远程版本号
     * 如果返回值大于0，则version1大于version2
     * 如果返回值等于0，则version1等于version2
     * 如果返回值小于0，则version1小于version2
     */
    static compareVersion(version1: string, version2: string): number;
    /**
     * 判断传入的字符串是否是json格式的字符串
     */
    static isJsonString(str: string): boolean;
    /**
     * 获取url参数
     * @param url
     */
    static getUrlParam(url: string): {
        url: string;
        params: {
            [key: string]: string;
        };
    };
    /**
     * 给url添加参数
     * @param url
     * @returns 新的url
     */
    static addUrlParam(url: string, key: string, value: string): string;
}

/**
 * @Description: 通用的 Promise 结果
 */
interface IPromiseResult {
    /** 0:成功 其他:失败 */
    code: number;
    /** 失败信息 */
    message: string;
}
interface ICheckUpdatePromiseResult extends IPromiseResult {
    /** 需要更新的资源大小 (KB) */
    size?: number;
}

/**
 * @Description: 全局定时器管理类
 */
declare class GlobalTimer {
    /**
     * 启动一个定时器，执行指定的回调函数。
     * @param callback - 要定时执行的回调函数。
     * @param interval - 定时器的时间间隔（秒）。
     * @param loop - [loop=0] 重复次数：0：回调一次，1~n：回调n次，-1：无限重复
     * @returns 返回定时器的ID。
     */
    static startTimer(callback: () => void, interval: number, loop?: number): number;
    /**
     * 停止指定ID的计时器。
     * @param timerId - 要停止的计时器的唯一标识符。
     */
    static stopTimer(timerId: number): void;
    /**
     * 暂停指定ID的计时器。
     * @param timerId - 要暂停的计时器的唯一标识符。
     */
    static pauseTimer(timerId: number): void;
    /**
     * 恢复指定ID的计时器。
     * @param timerId - 要恢复的计时器的唯一标识符。
     */
    static resumeTimer(timerId: number): void;
    /**
     * 清除所有定时器。
     */
    static clearAllTimer(): void;
}

/**
 * @Description: 内部使用的全局定时器
 */
declare class InnerTimer {
    private static _timer;
    /**
     * 初始化全局定时器，设置定时器间隔为16毫秒。
     * 此方法用于启动一个定时器实例，以便在整个应用程序中跟踪时间相关的操作。
     */
    static initTimer(): void;
    /**
     * 启动一个定时器，执行指定的回调函数。
     * @param callback - 要定时执行的回调函数。
     * @param interval - 定时器的时间间隔（秒）。
     * @param loop - [loop=0] 重复次数：0：回调一次，1~n：回调n次，-1：无限重复
     * @returns 返回定时器的ID。
     */
    private static get Timer();
    static startTimer(callback: () => void, interval: number, loop?: number): number;
    /**
     * 停止指定ID的计时器。
     * @param timerId - 要停止的计时器的唯一标识符。
     */
    static stopTimer(timerId: number): void;
    static update(dt: number): void;
}

/**
 * @Description: 二叉堆(默认最小堆) 支持最大堆和最小堆
 */
declare abstract class HeapNode {
    index: number;
    abstract lessThan(other: HeapNode): boolean;
}
declare class BinaryHeap<T extends HeapNode> {
    constructor(capacity: number);
    /**
     * 清空
     */
    clear(): void;
    /**
     * 获取节点
     * @param index 节点索引
     */
    get(index: number): T;
    /**
     * 获取顶部节点
     */
    top(): T;
    /**
     * 是否包含节点
     * @param node 节点
     */
    contains(node: T): boolean;
    /**
     * Push节点
     * @param node 节点
     */
    push(node: T): void;
    /**
     * Pop节点
     * @returns
     */
    pop(): T;
    /**
     * 移除节点
     * @param node 要移除的节点
     */
    remove(node: T): void;
    /**
     * 更新节点
     * @param node 要更新的节点
     */
    update(node: T): boolean;
    get count(): number;
    get empty(): boolean;
}

/** 单链表结结构节点 */
declare class LinkedNode<T> {
    element: T;
    next: LinkedNode<T>;
    constructor(element: T);
}
/** 双向链表结结构节点 */
declare class DoublyNode<T> extends LinkedNode<T> {
    prev: DoublyNode<T>;
    next: DoublyNode<T>;
    constructor(element: T);
}
/** 单向链表 */
declare class LinkedList<T> {
    /**
     * create
     * @param equalsFn 比较是否相等（支持自定义）
     */
    constructor(equalsFn?: (a: T, b: T) => boolean);
    /** 向链表尾部添加元素 */
    push(element: T): void;
    /**
     * 在链表的指定位置插入一个元素。
     * @param element 要插入的元素。
     * @param index 插入位置的索引，从0开始计数。
     * @returns 如果插入成功返回true，否则返回false。
     */
    insert(element: T, index: number): boolean;
    /**
     * 获取链表中指定位置的元素，如果不存在返回 underfined
     * @param index
     */
    getElementAt(index: number): LinkedNode<T>;
    /**
     * 从链表中移除一个元素
     * @param element
     */
    remove(element: T): T;
    /**
     * 从链表的特定位置移除一个元素
     * @param index
     */
    removeAt(index: number): T;
    /**
     * 返回元素在链表中的索引，如果没有则返回-1
     * @param element
     */
    indexOf(element: T): number;
    clear(): void;
    getHead(): LinkedNode<T>;
    isEmpty(): boolean;
    size(): number;
    toString(): string;
}
/** 双向链表 */
declare class DoublyLinkedList<T> extends LinkedList<T> {
    /**
     * create
     * @param equalsFn 比较是否相等（支持自定义）
     */
    constructor(equalsFn?: (a: T, b: T) => boolean);
    /**
     * 向链表尾部添加元素
     * @param element
     */
    push(element: T): void;
    /**
     * 向链表指定位置添加元素
     * @param element
     * @param index
     */
    insert(element: T, index: number): boolean;
    /**
     * 从链表的特定位置移除一个元素
     * @param index
     */
    removeAt(index: number): T;
    /**
     * 获取链表中指定位置的元素，如果不存在返回 null
     * @param index
     */
    getElementAt(index: number): DoublyNode<T>;
    getHead(): DoublyNode<T>;
    getTail(): DoublyNode<T>;
    clear(): void;
}

declare class Stack<T> {
    constructor(equalsFn?: (a: T, b: T) => boolean);
    push(element: T): void;
    pop(): T;
    peek(): T;
    size(): number;
    isEmpty(): boolean;
    clear(): void;
    toString(): string;
}

export { Adapter, Binary, BinaryHeap, CocosEntry, DoublyLinkedList, DoublyNode, GlobalTimer, HeapNode, InnerTimer, LinkedList, LinkedNode, Module, Platform, PlatformType, Screen, Stack, Time, Utils, debug, enableDebugMode, error, info, log, md5, warn };
export type { ICheckUpdatePromiseResult, IPromiseResult };
