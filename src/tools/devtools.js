/**
 * bindview-router 的 DevTools 集成
 * ------------------------------------------------------------------
 * 与 bindview 框架侧保持同一套约定:把路由信息抛给全局 Hook
 * `window.__BINDVIEW_DEVTOOLS_GLOBAL_HOOK__`(由浏览器调试插件注入)。
 *
 * 未安装调试插件时全部调用短路返回,对业务零影响、零异常。
 *
 * 上报内容:
 *   - router:init     插件安装({ mode, version, oldURL, newURL, query })
 *   - router:navigate 路由跳转({ oldURL, newURL, query, timestamp })
 *   - router:table    路由表变化({ tables: [{ paths, size }] })
 *
 * 同时把 Router 实例与路由表挂到 Hook 上(`hook.router` / `hook.routeTables`),
 * 使调试器可直接读取与控制路由。
 */

export const DEVTOOLS_HOOK_NAME = '__BINDVIEW_DEVTOOLS_GLOBAL_HOOK__'
export const DEVTOOLS_REPLAY_NAME = '__BINDVIEW_DEVTOOLS_HOOK_REPLAY__'

/** 路由插件运行时信息(模块级,供晚连接的调试器重放) */
const runtime = {
  plugin: null, // { mode, version, router, bus }
  tables: []    // [{ table, entries }],entries: [{ path, component }]
}

function getWindow() {
  try {
    return typeof window !== 'undefined' ? window : null
  } catch (e) {
    return null
  }
}

/**
 * 获取调试插件全局 Hook
 * @returns {Object|null}
 */
export function getDevtoolsHook() {
  const win = getWindow()
  if (!win) return null
  const hook = win[DEVTOOLS_HOOK_NAME]
  return hook && typeof hook.emit === 'function' ? hook : null
}

/**
 * 调试插件是否已安装
 * @returns {Boolean}
 */
export function isDevtoolsEnabled() {
  return getDevtoolsHook() !== null
}

/**
 * 向调试插件派发事件(未安装时为无操作)
 * @param {String} event
 * @param {Object} payload
 * @returns {Boolean}
 */
export function emitRouterDevtools(event, payload) {
  const hook = getDevtoolsHook()
  if (!hook) return false
  try {
    hook.emit(event, payload)
  } catch (e) {
    // 调试器异常不应影响路由
  }
  return true
}

/** 单个路由条目的组件 → 可跨进程传递的纯数据 */
function describeComponent(component) {
  if (component === null || component === undefined) return null
  if (typeof component === 'string') return { kind: 'string', name: component.slice(0, 60) }
  if (typeof component === 'number') return { kind: 'number', name: String(component) }
  if (typeof component === 'object' && typeof component.elementName === 'string') {
    return { kind: 'vnode', name: component.elementName.slice(0, 60) }
  }
  return null
}

/** 路由表 → 可跨进程传递的纯数据 */
function publicTables() {
  return runtime.tables.map(function (item) {
    var entries = item.entries.map(function (entry) {
      return { path: entry.path, component: entry.component }
    })
    return {
      paths: entries.map(function (entry) { return entry.path }),
      size: entries.length,
      entries: entries
    }
  })
}

/** 插件信息 → 可跨进程传递的纯数据 */
function describePlugin() {
  const plugin = runtime.plugin
  if (!plugin) return null
  const router = plugin.router
  return {
    mode: plugin.mode,
    version: plugin.version,
    oldURL: router ? router.oldURL : '',
    newURL: router ? router.newURL : '',
    query: router && router.query ? router.query : null
  }
}

/** 把运行时信息挂到 Hook 上,便于调试器直接访问 */
function attachRuntime(hook) {
  if (!hook) return
  try {
    hook.router = runtime.plugin
    hook.routeTables = publicTables()
  } catch (e) {
    // ignore
  }
}

/**
 * 注册路由插件实例(hash / history 安装时调用)
 * @param {Object} info { mode, version, router, bus }
 */
export function registerRouterPlugin(info) {
  runtime.plugin = {
    mode: info.mode,
    version: info.version,
    router: info.router,
    bus: info.bus
  }
  attachRuntime(getDevtoolsHook())
  emitRouterDevtools('router:init', describePlugin())
}

/**
 * 注册 / 更新一张路由表(CreateRouterTable 创建或变更时调用)
 * @param {Object} table RouterTable 实例
 */
export function registerRouteTable(table) {
  if (!table || !(table.RouterTable instanceof Map)) return

  const entries = []
  table.RouterTable.forEach(function (component, path) {
    entries.push({ path: String(path), component: describeComponent(component) })
  })

  let entry = null
  for (let i = 0; i < runtime.tables.length; i++) {
    if (runtime.tables[i].table === table) {
      entry = runtime.tables[i]
      break
    }
  }
  if (entry) {
    entry.entries = entries
  } else {
    runtime.tables.push({ table: table, entries: entries })
  }

  attachRuntime(getDevtoolsHook())
  emitRouterDevtools('router:table', { tables: publicTables() })
}

/**
 * 调试器晚于路由插件加载时的重放
 */
function installReplay(win) {
  try {
    const replay = win[DEVTOOLS_REPLAY_NAME] || (win[DEVTOOLS_REPLAY_NAME] = [])
    replay.push(function (hook) {
      attachRuntime(hook)
      if (runtime.plugin) emitRouterDevtools('router:init', describePlugin())
      if (runtime.tables.length) emitRouterDevtools('router:table', { tables: publicTables() })
    })
  } catch (e) {
    // ignore
  }
}

const __win = getWindow()
if (__win) installReplay(__win)

export default {
  DEVTOOLS_HOOK_NAME,
  DEVTOOLS_REPLAY_NAME,
  getDevtoolsHook,
  isDevtoolsEnabled,
  emitRouterDevtools,
  registerRouterPlugin,
  registerRouteTable
}
