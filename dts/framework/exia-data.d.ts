/**
 * 该数据工具类 就是用来解决 服务器数据到游戏DataComp 格式上的统一
 * eg1:对于数组对象 可以转换为一个Map
 */
declare class DataCompFormatUtil {
    /**
     * 对象进行赋值
     * 处理
     * 元对象
     * {
     *    k1:v1,
     *    k2:v2
     * }
     * 目标对象
     * {
     *    k1:v1,
     *    k2:v2
     * }
     * */
    static CloneObject(target: Record<string, any>, source: Record<string, any>): void;
    /**
     * 处理
     * [
     *    {k1:value,k2:[{k3:value,k4:value}]},
     *    {k1:value,k2:[{k3:value,k4:value}]},
     * ]
     * @param source 需要处理的数据
     * @param target1 将整个对象存起来
     * @param target2 k2:[{k3:value,k4:value}] 将这个里面的数据保存为k,v map
     */
    static ArrayObject2Map(source: any[], target1: any, target2: any): void;
    /**
     * 处理
     * [
     *  {k1:v1,K2:v2,...},
     *  ....
     * ]
     * @param source 需要处理的数据
     * @param target 将整个对象存起来
     * @param key 就是source中对象中的任意字段key
     */
    static ArrayObject2MapByKey(source: any[], target: any, key: any): void;
    /**
     * 处理对象数据根据枚举映射到Map中 注意枚举中的值应该跟对象值一一对应
     * 源数据
     * source:Object{
     *  aiActivityRankList: msg_ai_activity.Iai_activity_base[];
     *  aiActivityLimitRechargeList: msg_ai_activity.Iai_activity_base[];
     *  aiActivityLimitGiftList: msg_ai_activity.Iai_activity_base[];
     *  ........
     * }
     *
     * 处理过程：
     * 交给数据自己处理吧
     *
     * 目标数据
     * target:Map<k:v>={
     *  k:enum(type)---->v:aiActivityRankList
     *  ......
     * }
     */
    static ObjectByEnum2Map(source: any, enums: any, target: any): void;
    /**
     * 处理功能开放数据格式
     */
    static StrToArray(str: string, frist?: string, second?: string): string[][];
}

type DataCompType = string;

/**
 * @Description: 数据装饰器
 *
 * dataCompDependency / dataCompInject 重构说明：
 *  - 原实现用 args.push 将 DataComp 追加到末尾，方法签名和注入顺序对不上
 *  - 新实现改为 prepend（前置注入）：DataComp 实例插在参数列表最前面
 *  - 方法签名直接声明注入参数，调用时只需传业务参数，装饰器自动填入 DataComp 实例
 *  - 提供 Inject<T> 类型标记，让签名在 IDE 中一眼区分"自动注入"和"手动传入"
 */

/** 构造函数类型 */
type DataCompConstructor<T = any> = new () => T;
declare namespace _dataDecorator {
    /**
     * 数据组件装饰器
     * 将类注册为指定 DataCompType 的数据组件。
     * 同时在构造函数上写入 DataMetadataKey.compType 静态属性（防混淆）。
     *
     * @param type DataCompType 枚举值
     *
     * @example
     * // 在各模块的 XxxDataCompType.ts 中定义类型常量，再传入
     * @_dataDecorator.dataComp(PlayerDataCompType.PlayerBaseDataComp)
     * export class PlayerBaseDataComp { ... }
     */
    function dataComp(type: DataCompType): ClassDecorator;
    /**
     * 数据观察者装饰器
     * 将类标记为 DataWatcher，并声明它持有哪些 DataComp。
     * 持有的 DataComp 实例会以 compType 为 key 挂载到 watcher 原型上，
     * DataSys.RegisterWatcher 时统一实例化并纳入 _recordDataComp。
     *
     * @param comps 该 Watcher 持有的 DataComp 构造函数列表（已被 @dataComp 注册）
     *
     * @example
     * @_dataDecorator.dataWatcher(PlayerBaseDataComp, PlayerItemDataComp, PlayerUnitDataComp)
     * export class PlayerDataWatcher { ... }
     */
    function dataWatcher(...comps: DataCompConstructor[]): ClassDecorator;
    /**
     * DataComp 前置注入装饰器（方法级）
     *
     * 调用被装饰的方法时，自动将指定 DataComp 实例作为方法的**前几个参数**注入。
     * 方法签名中，注入参数写在最前面，手动传入的业务参数写在后面。
     * 调用方只需传业务参数，注入参数由装饰器自动填充。
     *
     * @param comps 需要注入的 DataComp 构造函数列表（顺序对应参数顺序）
     *
     * ─── 使用示例 ──────────────────────────────────────────────────
     *
     * // 1. 只有注入参数，无业务参数
     * @_dataDecorator.dataCompDependency([PlayerBaseDataComp])
     * refreshUI(base: Inject<PlayerBaseDataComp>) {
     *     this.lblName.string  = base.PlayerName;
     *     this.lblLevel.string = String(base.Level);
     * }
     * // 调用：this.refreshUI()
     *
     * // 2. 注入参数 + 业务参数（注入在前，业务在后）
     * @_dataDecorator.dataCompDependency([PlayerBaseDataComp, PlayerItemDataComp])
     * onLevelUp(
     *     base : Inject<PlayerBaseDataComp>,
     *     item : Inject<PlayerItemDataComp>,
     *     newLv: number,                      // ← 手动传入
     * ) {
     *     base.SetLevel(newLv);
     *     item.SetNowSkin(base.RoleID as any);
     * }
     * // 调用：this.onLevelUp(10)  → 实际执行: original(baseInst, itemInst, 10)
     *
     * // 3. 多个 DataComp，无额外参数
     * @_dataDecorator.dataCompDependency([PlayerBaseDataComp, PlayerUnitDataComp])
     * calcPower(
     *     base : Inject<PlayerBaseDataComp>,
     *     unit : Inject<PlayerUnitDataComp>,
     * ): number {
     *     return base.Level * unit.skills.size;
     * }
     * // 调用：const power = this.calcPower()
     * ───────────────────────────────────────────────────────────────
     */
    function dataCompDependency(comps: DataCompConstructor[]): MethodDecorator;
}

/**
 * @Description: 数据系统
 *
 * AutoWatcher 流程：
 *   DataWatcher 协议方法直接修改 DataComp 属性
 *     → Proxy set 拦截，将 compType 写入 _dirtySet
 *     → 调用 AutoWatcher() 触发 flush
 *     → 遍历 _dirtySet，逐 compType 通知所有订阅回调
 *     → 回调内若调用 UpdateDataComp（回源），新的脏标记进入下一轮 flush
 *     → while 循环处理多轮回源，MAX_FLUSH_DEPTH 防无限反馈
 *
 * 对 Map / Array 深层变更：Proxy 只拦截顶层属性赋值，
 * 集合内部 .set() / .push() 不触发拦截，需手动调用
 * DataSys.NotifyChanged(PlayerUnitDataComp) 标脏。
 */

declare class DataSys {
    private static _instance;
    /** compType string → DataComp Proxy 实例 */
    private readonly _recordDataComp;
    /** 索引签名，允许通过字符串访问动态添加的属性 */
    [key: string]: any;
    /** compType string → 订阅回调集合 */
    private readonly _subscribers;
    /** 待通知的脏 compType 集合（Set 自动去重） */
    private readonly _dirtySet;
    /** flush 正在执行，防止同一轮重入 */
    private _flushing;
    /** 当前 flush 深度，超过上限视为无限反馈，强制终止 */
    private _flushDepth;
    /** 最大回源深度（每一轮 flush 后业务回源再次标脏算一层） */
    private static readonly MAX_FLUSH_DEPTH;
    static GetDataSys(): DataSys;
    /** 清除 / 重置所有数据及订阅状态 */
    Clear(): void;
    /**
     * 获取 DataComp 或 DataWatcher 实例。
     * 传入什么类型就返回什么类型。
     *
     * @example
     * const base    = DataSys.Get(PlayerBaseDataComp);
     * const watcher = DataSys.Get(PlayerDataWatcher);
     */
    static Get<T>(ctor: new () => T): T;
    /**
     * 注册 DataWatcher（含其持有的所有 DataComp）。
     * DataComp 实例会被 Proxy 包裹，属性赋值自动标脏。
     */
    RegisterWatcher<T>(ctor: new () => T): T;
    /**
     * 卸载 DataWatcher（含清理其持有的 DataComp 引用及订阅）
     */
    UninstallWatcher(ctor: Function): void;
    /**
     * 用服务器数据批量更新 DataComp（浅拷贝）。
     * 因为目标是 Proxy，CloneObject 内部的赋值会自动触发标脏。
     */
    UpdateDataComp(ctor: DataCompConstructor, source: object): void;
    /**
     * 订阅 DataComp 变更通知。
     * callback 在每次 AutoWatcher flush 时收到最新的 DataComp 实例。
     *
     * @param ctor     DataComp 构造函数（已被 @_dataDecorator.dataComp 注册）
     * @param callback 回调，参数为 DataComp 实例
     * @param target   回调绑定的 this（用于 UnwatchByTarget 批量卸载）
     *
     * @example
     * DataSys.Watch(PlayerBaseDataComp, (base) => {
     *     this.lblLevel.string = String(base.Level);
     * }, this);
     */
    static Watch<T>(ctor: new () => T, callback: (comp: T) => void, target?: any): void;
    /**
     * 取消订阅指定回调。
     *
     * @example
     * DataSys.Unwatch(PlayerBaseDataComp, this.onLevelChange);
     */
    static Unwatch<T>(ctor: new () => T, callback: (comp: T) => void): void;
    /**
     * 批量取消某个 target 对象绑定的所有订阅。
     * 适合在 UI 组件 onClose / onDestroy 时统一卸载：
     *
     * @example
     * DataSys.UnwatchByTarget(this);
     */
    static UnwatchByTarget(target: any): void;
    /**
     * 手动标记 DataComp 为脏（用于 Map / Array 深层变更）。
     * Proxy 只拦截顶层属性赋值，Map.set() / Array.push() 等集合操作
     * 不会被自动捕获，需在操作后手动调用此方法。
     *
     * @example
     * this.playerUnitDataComp.skills.set(id, skill);
     * DataSys.NotifyChanged(PlayerUnitDataComp);   // 手动标脏
     */
    static NotifyChanged<T>(ctor: new () => T): void;
    /**
     * 自观察 flush 方法。
     *
     * 流程：
     *   数据观察者 → 检测到数据改变（Proxy 标脏 / NotifyChanged）
     *     → 修改数据 → 通知各 DataComp 订阅者
     *     → 业务逻辑若调用了 UpdateDataComp（回源）则再次标脏
     *     → while 循环继续 flush，直至无脏或超出 MAX_FLUSH_DEPTH
     *
     * 调用时机：
     *   - 协议批处理完成后手动调用（推荐）：DataSys.GetDataSys().AutoWatcher()
     *   - 或在游戏帧更新（Update）中每帧调用，实现全自动响应
     */
    AutoWatcher(): void;
    /**
     * 用 Proxy 包裹 DataComp 实例。
     * 拦截顶层属性的 set 操作，将 compType 写入 _dirtySet。
     * 注意：Proxy 只感知浅层赋值，Map / Array 内部变更需手动 NotifyChanged。
     */
    private _createObservable;
    private _markDirty;
    private _addSubscriber;
    private _removeSubscriber;
    private _getWatcher;
    private _getDataComp;
    private _clearDataComp;
}

export { DataCompFormatUtil, DataSys, _dataDecorator };
