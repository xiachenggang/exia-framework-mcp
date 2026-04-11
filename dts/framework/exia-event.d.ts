/**
 * @Description: 事件管理器 - 支持递归保护
 */
/**
 * 事件管理器 - 防止递归调用栈溢出
 *
 * 功能特性：
 * - 递归深度限制防止栈溢出
 * - 完全向后兼容现有API
 */
declare class EventManager {
    /**
     * 添加事件监听器
     * @param name - 事件名称
     * @param callback - 回调函数，当事件触发时执行
     * @param target - 可选参数，指定事件监听的目标对象
     * @returns 返回事件ID，可用于移除事件
     */
    add(name: string, callback: (...args: any[]) => void, target?: any): number;
    /**
     * 添加一个只触发一次的事件监听器
     * @param name - 事件名称
     * @param callback - 事件触发时要执行的回调函数
     * @param target - 可选参数，指定事件监听器的目标对象
     * @returns 返回事件ID，可用于移除事件
     */
    addOnce(name: string, callback: (...args: any[]) => void, target?: any): number;
    /**
     * 发送事件给所有注册的监听器（带递归保护）
     * @param name - 事件名称
     * @param target - 可选参数，指定目标对象，只有目标对象匹配时才会触发监听器
     * @param args - 传递给监听器回调函数的参数
     */
    send(name: string, target?: any, ...args: any[]): void;
    /**
     * 通过事件ID移除事件
     * @param eventId 事件ID
     */
    remove(eventId: number): void;
    /**
     * 移除指定名称的所有事件
     * @param name 事件名称
     */
    removeByName(name: string): void;
    /**
     * 移除指定目标的所有事件
     * @param target 目标对象
     */
    removeByTarget(target: any): void;
    /**
     * 移除指定名称和指定目标的事件
     * @param name 事件名称
     * @param target 绑定的目标对象
     */
    removeByNameAndTarget(name: string, target: any): void;
    /**
     * 清空所有注册的事件
     */
    clearAll(): void;
}

/**
 * @Description: 全局事件
 */
declare class GlobalEvent {
    /**
     * 添加一个事件
     * @param name 事件名称
     * @param callback 事件回调
     * @param target 事件目标
     */
    static add(name: string, callback: (...args: any[]) => void, target?: any): number;
    /**
     * 添加一个只触发一次的事件
     */
    static addOnce(name: string, callback: (...args: any[]) => void, target?: any): number;
    /**
     * 发送一个事件
     * @param name 事件名称
     * @param args 事件参数
     */
    static send(name: string, ...args: any[]): void;
    /**
     * 发送一个事件给指定目标
     * @param name 事件名称
     * @param target 事件目标
     * @param args 事件参数
     */
    static sendToTarget(name: string, target: any, ...args: any[]): void;
    /**
     * 移除一个指定ID的事件
     * @param eventId 事件ID
     */
    static remove(eventId: number): void;
    static removeByName(name: string): void;
    static removeByTarget(target: any): void;
    /**
     * 通过目标和事件名称批量移除事件
     * @param name 事件名称
     * @param target 事件目标
     */
    static removeByNameAndTarget(name: string, target: any): void;
    /**
     * 清空所有事件
     */
    static clearAll(): void;
}

export { EventManager, GlobalEvent };
